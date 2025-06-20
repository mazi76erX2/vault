import os
import argparse
import logging
import re
from datetime import datetime
from openai import AzureOpenAI
from langchain.text_splitter import CharacterTextSplitter
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import SearchIndex
from azure.search.documents.indexes.models import (
    HnswParameters,
    HnswVectorSearchAlgorithmConfiguration,
    PrioritizedFields,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SemanticConfiguration,
    SemanticField,
    SemanticSettings,
    SimpleField,
    VectorSearch,
)
from pathlib import Path
from dotenv import load_dotenv

# Load .env from current directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)



def get_index(name: str) -> SearchIndex:
    """
    Returns an Azure Cognitive Search index with the given name.
    """
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SimpleField(name="sourcefile", type=SearchFieldDataType.String),
        SimpleField(name="title", type=SearchFieldDataType.String),
        SimpleField(name="date", type=SearchFieldDataType.String),
        SimpleField(name="access_level", type=SearchFieldDataType.Int32),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SearchField(
            name="embedding",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            vector_search_dimensions=1536,
            vector_search_configuration="default",
        ),
    ]

    semantic_settings = SemanticSettings(
        configurations=[
            SemanticConfiguration(
                name="default",
                prioritized_fields=PrioritizedFields(
                    title_field=None,
                    prioritized_content_fields=[SemanticField(field_name="content")],
                ),
            )
        ]
    )

    vector_search = VectorSearch(
        algorithm_configurations=[
            HnswVectorSearchAlgorithmConfiguration(
                name="default",
                kind="hnsw",
                parameters=HnswParameters(metric="cosine"),
            )
        ]
    )

    index = SearchIndex(
        name=name,
        fields=fields,
        semantic_settings=semantic_settings,
        vector_search=vector_search,
    )

    return index

def load_text_files_from_folder(folder_path):
    """
    Loads all .txt files from the specified folder and returns their content.
    """
    docs = []
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.txt'):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                title_match = re.search(r'- Title:\s*(.*)', content)
    
                if title_match:
                    title = title_match.group(1).strip()
 
                else:
                    title = "Title not provided"
                level_match = re.search(r'- Level:\s*(.*)', content)
    
                if level_match:
                    level = level_match.group(1).strip()
 
                else:
                    level = "Level not provided"
                docs.append({"file_name": file_path, "content": content, "file_title": title, "level": level })
    return docs


def main(args):
    logging.info("Data Ingestion Process Started ...")
    AZURE_SEARCH_ENDPOINT = "https://hico-vault-knowledge-base.search.windows.net"
    AZURE_SEARCH_KEY = "BrpQfaGVRkT3k72dwLMCs9LIYd5IXBGpW38L2mHPyQAzSeCICYbL"
    AZURE_SEARCH_INDEX_NAME = "hicovault"

    clientOpenAI = AzureOpenAI(
        azure_endpoint=os.environ['AZURE_OPENAI_ENDPOINT'],
        api_key=os.environ['AZURE_OPENAI_KEY'],
        api_version="2024-02-15-preview"
    )

    # Load text files from the specified folder
    folder_path = args.folder_path
    text_docs = load_text_files_from_folder(folder_path)
    
    # Initialize Azure Cognitive Search client
    search_index_client = SearchIndexClient(AZURE_SEARCH_ENDPOINT, AzureKeyCredential(AZURE_SEARCH_KEY))
    logging.info("Loading Text Files ...")

    datas = []
    counter = 0
    splitter = CharacterTextSplitter(
        separator='\n',
        chunk_size=5000,
        chunk_overlap=20
    )

    # Process each text document
    for doc in text_docs:
        chunks = splitter.split_text(doc["content"])
        for chunk in chunks:
            counter += 1
            data = {
                "id": str(counter),
                "content": chunk,
                "sourcefile": doc["file_name"],
                "title": doc["file_title"],
                "date": datetime.now().date(),  # or extract actual date if available
                "access_level": doc["level"],
            }
            datas.append(data)
    
    logging.info("Converting Data into Embeddings ...")

    for doc in datas:
        doc["embedding"] = clientOpenAI.embeddings.create(input=doc["content"], model="embedding-rag-confluence").data[0].embedding

    # Create an Azure Cognitive Search index
    index = get_index(AZURE_SEARCH_INDEX_NAME)
    search_index_client.create_or_update_index(index)
    logging.info("Uploading Embeddings into Vector Storage Place ...")

    # Upload data to the index
    search_client = SearchClient(
        endpoint=AZURE_SEARCH_ENDPOINT,
        index_name=AZURE_SEARCH_INDEX_NAME,
        credential=AzureKeyCredential(AZURE_SEARCH_KEY),
    )
    search_client.upload_documents(datas)
    logging.info("Data Ingestion Process Completed.")
    print("Data Ingestion Process Completed.")
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder_path", type=str, default=r"C:\Users\ars\OneDrive - highcoordination.de\KnowledgeBaseProjects\KB_docs", help="Path to the folder containing .txt files.")
    args = parser.parse_args()
    main(args)
