from typing import List, Dict

import os
import logging
import gradio as gr
from datetime import datetime
import hashlib

from langchain_community.document_loaders import ConfluenceLoader
from atlassian import Confluence
from openai import AzureOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
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
from app.connectors.sharepoint_client import SharePointClient
from pathlib import Path
from dotenv import load_dotenv
import os
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

# Load .env from current directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set the lowest severity level to capture
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("testing.log"),  # Log messages to a file
        logging.StreamHandler(),  # Print messages to the console
    ],
)


def check_doc_in_index(search_client, doc_id, last_modified_date):
    """
    Check if a document with the given doc_id exists in the Azure Cognitive Search index.

    Args:
        search_client (SearchClient): An instance of the Azure Cognitive Search client.
        doc_id (str): The unique document ID to search for.

    Returns:
        bool: True if the document exists, False otherwise.
    """
    query = doc_id
    results = search_client.search(
        query, search_fields=["doc_id"]
    )  # Limit results to 1 for efficiency
    ids = []
    is_old = False
    for result in results:  # If any result exists, the doc_id is in the index
        if doc_id == result.get("doc_id"):
            is_old = True
            if last_modified_date != result.get("last_modified_date"):
                ids.append(result.get("id"))
    return ids, is_old


def get_index(name: str) -> SearchIndex:
    """
    Returns an Azure Cognitive Search index with the given name.
    """
    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="doc_id", type=SearchFieldDataType.String),
        SimpleField(name="chunk_index", type=SearchFieldDataType.Int32),
        SimpleField(name="sourcefile", type=SearchFieldDataType.String),
        SimpleField(name="title", type=SearchFieldDataType.String),
        SimpleField(name="created_date", type=SearchFieldDataType.String),
        SimpleField(name="last_modified_date", type=SearchFieldDataType.String),
        SimpleField(name="created_by", type=SearchFieldDataType.String),
        SimpleField(name="last_modified_by", type=SearchFieldDataType.String),
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


def load_from_confluence_loader(confluence_url, username, api_key, space_key):
    """Load HTML files from Confluence"""
    loader = ConfluenceLoader(url=confluence_url, username=username, api_key=api_key)

    docs = loader.load(space_key=space_key, include_attachments=True)
    return docs


def get_all_parent_titles_dict(
    confluence_url: str, username: str, api_token: str, page_ids: List
) -> Dict:
    """
    Retrieve and store all parent page titles in a dictionary with page IDs.
    """
    # Initialize the Confluence client
    confluence = Confluence(
        url=confluence_url,
        username=username,
        password=api_token,  # For cloud instances, use API token as password
    )
    parent_titles = {}
    for page_id in page_ids:

        current_id = page_id

        # Fetch the current page details
        page = confluence.get_page_by_id(current_id, expand="ancestors")

        # Check if there are ancestors
        ancestors = page.get("ancestors", [])
        temp_list = []
        for ancestor in ancestors:
            temp_list.append(ancestor["title"])
        parent_titles[current_id] = temp_list

    return parent_titles


def get_hiearchy_space(docs, confluence_url, username, api_key):
    docs_ids = []
    for doc in docs:
        docs_ids.append(doc.metadata["id"])

    # add how to get the tree
    hiearchy = get_all_parent_titles_dict(confluence_url, username, api_key, docs_ids)

    return hiearchy


def format_hierarchy(page_id, page_tree):
    """
    Formats the hierarchy into a string from the list of ancestors.
    """
    if page_id in page_tree:
        return " > ".join(page_tree[page_id][::-1])  # Reverse to start from the root
    return "No hierarchy available"


def augment_content_with_hierarchy(content: str, hierarchy: str, date: str) -> str:
    """
    Augments content with hierarchy and date information.
    """
    hierarchy_info = f"This is the page hierarchy of the content: {hierarchy}"
    date_info = f"Published on: {date}"
    return f"{hierarchy_info}\n{date_info}\n\n{content}"


def generate_doc_id(file_name, file_url):
    unique_str = f"{file_name}_{file_url}"
    return hashlib.md5(unique_str.encode()).hexdigest()


def generate_chunk_ids(doc_id, num_chunks):
    return [f"{doc_id}_chunk_{i}" for i in range(1, num_chunks + 1)]


def store_confluence_in_azure_kb(confluence_url, username, api_key, space_key, index):
    AZURE_SEARCH_ENDPOINT = os.environ["AZURE_SEARCH_ENDPOINT"]
    AZURE_SEARCH_KEY = os.environ["AZURE_SEARCH_KEY"]
    AZURE_SEARCH_INDEX_NAME = index

    search_client = SearchClient(
        endpoint=AZURE_SEARCH_ENDPOINT,
        index_name=AZURE_SEARCH_INDEX_NAME,
        credential=AzureKeyCredential(AZURE_SEARCH_KEY),
    )
    clientOpenAI = AzureOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_KEY"],
        api_version="2024-02-15-preview",
    )
    search_index_client = SearchIndexClient(
        AZURE_SEARCH_ENDPOINT, AzureKeyCredential(AZURE_SEARCH_KEY)
    )
    docs = load_from_confluence_loader(confluence_url, username, api_key, space_key)
    page_tree = get_hiearchy_space(docs, confluence_url, username, api_key)
    # Split data into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=5000, chunk_overlap=20, length_function=len
    )
    chunks = text_splitter.split_documents(docs)
    datas = []
    # Store the data into Azure search index
    chunk_counter = 0
    doc_counter = ""
    for index, chunk in enumerate(chunks):
        hierarchy = format_hierarchy(chunk.metadata["id"], page_tree)
        augmented_content = augment_content_with_hierarchy(
            chunk.page_content, hierarchy, chunk.metadata["when"][:10]
        )

        doc_id = generate_doc_id(chunk.metadata["title"], chunk.metadata["source"])
        try:
            ids, is_old = check_doc_in_index(
                search_client, doc_id, chunk.metadata["when"][:10]
            )
        except:
            ids = []
            is_old = False

        if ids:
            print(f"the file: {chunk.metadata['title']} deleted from the KB")

            search_client.delete_documents(ids)

            if doc_id == doc_counter:
                chunk_counter += 1
            else:
                doc_counter = doc_id
                chunk_counter = 0
            chunk_id = (
                f"{doc_id}_chunk_{chunk_counter}"  # Combine doc_id and chunk index
            )
            data = {
                "id": chunk_id,
                "doc_id": doc_id,
                "chunk_index": chunk_counter,
                "content": augmented_content,
                "sourcefile": chunk.metadata["source"],
                "title": chunk.metadata["title"],
                "created_date": "",
                "last_modified_date": "",
                "created_by": "",
                "last_modified_by": chunk.metadata["when"][:10],
                "access_level": 1,
            }
            datas.append(data)
        if not is_old:
            if doc_id == doc_counter:
                chunk_counter += 1
            else:
                doc_counter = doc_id
                chunk_counter = 0
            chunk_id = (
                f"{doc_id}_chunk_{chunk_counter}"  # Combine doc_id and chunk index
            )
            data = {
                "id": chunk_id,
                "doc_id": doc_id,
                "chunk_index": chunk_counter,
                "content": augmented_content,
                "sourcefile": chunk.metadata["source"],
                "title": chunk.metadata["title"],
                "created_date": "",
                "last_modified_date": chunk.metadata["when"][:10],
                "created_by": "",
                "last_modified_by": "",
                "access_level": 1,
            }
            datas.append(data)

    for doc in datas:
        doc["embedding"] = (
            clientOpenAI.embeddings.create(
                input=doc["content"], model="embedding-rag-confluence"
            )
            .data[0]
            .embedding
        )

    # Create an Azure Cognitive Search index.
    index = get_index(AZURE_SEARCH_INDEX_NAME)
    search_index_client.create_or_update_index(index)

    # Upload our data to the index.

    if datas:
        search_client.upload_documents(datas)


def store_sharepoint_in_azure_kb(site_hostname, site_path, index):
    CLIENT_ID = os.environ["sharepoint_Client_ID"]
    CLIENT_SECRET = os.environ["sharepoint_Secret"]
    TENANT_ID = os.environ["TENANT_ID"]
    site_url = f"{site_hostname}:/sites/{site_path}"
    logging.info("Starting the SharePoint Client")
    sharepoint_client = SharePointClient(
        TENANT_ID, CLIENT_ID, CLIENT_SECRET, "https://graph.microsoft.com/", index
    )
    site_id = sharepoint_client.get_site_id(site_url)
    print("Site ID:", site_id)

    drive_info = sharepoint_client.get_drive_id(site_id)
    print("Root folder:", drive_info)

    drive_id = drive_info[0][0]  # Assume the first drive ID
    folder_content = sharepoint_client.get_folder_content(site_id, drive_id)

    for folder_name in folder_content.keys():
        logging.info(f"Processing the SharePoint folder: {folder_name}")
        folder_id = folder_content[folder_name]
        sharepoint_client.process_folder_contents(
            site_id, drive_id, folder_id, local_folder_path="data"
        )


def store_in_azure_kb(doc):
    AZURE_SEARCH_ENDPOINT = os.environ["AZURE_SEARCH_ENDPOINT"]
    AZURE_SEARCH_KEY = os.environ["AZURE_SEARCH_KEY"]
    AZURE_SEARCH_INDEX_NAME = "hicovault"

    clientOpenAI = AzureOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_KEY"],
        api_version="2024-02-15-preview",
    )

    # Initialize Azure Cognitive Search client
    search_index_client = SearchIndexClient(
        AZURE_SEARCH_ENDPOINT, AzureKeyCredential(AZURE_SEARCH_KEY)
    )

    datas = []
    counter = 0
    splitter = CharacterTextSplitter(separator="\n", chunk_size=5000, chunk_overlap=20)

    # Process each text document
    chunks = splitter.split_text(doc["content"])
    for chunk in chunks:
        counter += 1
        data = {
            "id": str(counter),
            "content": chunk,
            "sourcefile": doc["file_name"],
            "title": doc["file_title"],
            "created_date": datetime.now().date(),  # or extract actual date if available
            "access_level": doc["level"],
        }
        datas.append(data)

    for doc in datas:
        doc["embedding"] = (
            clientOpenAI.embeddings.create(
                input=doc["content"], model="embedding-rag-confluence"
            )
            .data[0]
            .embedding
        )

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


def store_confluence_in_qdrant(
    confluence_url: str,
    username: str,
    api_key: str,
    space_key: str,
    collection_name: str = "confluence-kb",
    host: str = "localhost",
    port: int = 6333,
    chunk_size: int = 5000,
    chunk_overlap: int = 20,
    embedding_model: str = "all-MiniLM-L6-v2",
):
    """
    Extract documents from a Confluence space, split them into manageable chunks,
    create embeddings for each chunk and store them in a Qdrant collection.

    Parameters:
      confluence_url (str): The base URL of your Confluence instance.
      username (str): Username for Confluence.
      api_key (str): API token for Confluence.
      space_key (str): Key for the Confluence space.
      collection_name (str): Name of the Qdrant collection to store documents.
      host (str): Qdrant server host.
      port (int): Qdrant server port.
      chunk_size (int): Maximum number of characters per text chunk.
      chunk_overlap (int): Number of overlapping characters between chunks.
      embedding_model (str): SentenceTransformer model to use for creating embeddings.
    """

    # Step 1: Load data from Confluence.
    print(f"Extracting data from Confluence space '{space_key}' at: {confluence_url}")
    docs = load_from_confluence_loader(confluence_url, username, api_key, space_key)
    page_tree = get_hiearchy_space(docs, confluence_url, username, api_key)

    # Step 2: Split documents into chunks.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap, length_function=len
    )
    chunks = text_splitter.split_documents(docs)
    print(f"Split Confluence documents into {len(chunks)} chunks.")

    # Step 3: Create embeddings for each chunk.
    embedder = SentenceTransformer(embedding_model)

    # Step 4: Initialize Qdrant client and recreate the collection.
    # Adjust the 'size' in vectors_config to match your chosen embedding model's dimension,
    # e.g., for "all-MiniLM-L6-v2" the vector size is 384.
    client = QdrantClient(host=host, port=port)
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config={"size": 384, "distance": "Cosine"},
    )

    points = []
    for i, chunk in enumerate(chunks):
        # Prepare the hierarchy if available.
        hierarchy = (
            format_hierarchy(chunk.metadata["id"], page_tree)
            if "id" in chunk.metadata
            else ""
        )
        augmented_content = (
            augment_content_with_hierarchy(
                chunk.page_content, hierarchy, chunk.metadata["when"][:10]
            )
            if "when" in chunk.metadata
            else chunk.page_content
        )

        # Create embedding for the (augmented) content.
        embedding = embedder.encode(augmented_content).tolist()

        # Generate a document ID based on available metadata.
        doc_id = (
            generate_doc_id(chunk.metadata["title"], chunk.metadata["source"])
            if "title" in chunk.metadata and "source" in chunk.metadata
            else str(uuid.uuid4())
        )

        # Create a unique identifier for each chunk in Qdrant.
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "doc_id": doc_id,
                "chunk_index": i,
                "content": augmented_content,
                "sourcefile": (
                    chunk.metadata["source"]
                    if "source" in chunk.metadata
                    else confluence_url
                ),
                "title": chunk.metadata.get("title", "No Title"),
                "created_date": (
                    chunk.metadata["when"][:10] if "when" in chunk.metadata else ""
                ),
                "last_modified_date": (
                    chunk.metadata["when"][:10] if "when" in chunk.metadata else ""
                ),
                "created_by": "",  # Optionally provide creator information.
                "access_level": 1,
            },
        )
        points.append(point)

    # Step 5: Insert the points into Qdrant.
    client.upsert(collection_name=collection_name, points=points)
    print(f"Inserted {len(points)} chunks into Qdrant collection '{collection_name}'.")
