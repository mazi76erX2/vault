import os
import argparse
from openai import AzureOpenAI
from logging import config
from typing import List, Dict
from azure.search.documents.indexes import SearchIndexClient
from langchain_community.document_loaders import ConfluenceLoader
from atlassian import Confluence, Jira
from langchain.text_splitter import RecursiveCharacterTextSplitter
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
    SearchIndex,
    SemanticConfiguration,
    SemanticField,
    SemanticSettings,
    SimpleField,
    VectorSearch,
)
import gradio as gr

from app.connectors.store_data_in_kb import store_confluence_in_azure_kb, store_sharepoint_in_azure_kb


def fn_connect_confluence(url, user, api, keyspace, index):
    store_confluence_in_azure_kb(url, user, api, keyspace, index)
    gr.Info("Confluence Documents stored in the Knowledge Base")
    return gr.Textbox(''), gr.Textbox(''), gr.Textbox(''), gr.Textbox(''), gr.Textbox('')

def fn_connect_sharepoint(hostname, sitepath, index):
    store_sharepoint_in_azure_kb(hostname, sitepath, index)
    gr.Info("SharePoint Documents stored in the Knowledge Base")
    return gr.Textbox(''), gr.Textbox(''), gr.Textbox('')


def load_from_confluence_loader(confluence_url, username, api_key, space_key):
    """Load HTML files from Confluence"""
    loader = ConfluenceLoader(
        url=confluence_url,
        username=username,
        api_key=api_key
    )

    docs = loader.load(
        space_key=space_key,
        include_attachments=True
        )
    return docs

def get_all_parent_titles_dict(confluence_url: str, username: str, api_token: str, page_ids: List) -> Dict:
    """
    Retrieve and store all parent page titles in a dictionary with page IDs.
    """
    # Initialize the Confluence client
    confluence = Confluence(
        url=confluence_url,
        username=username,
        password=api_token  # For cloud instances, use API token as password
    )
    parent_titles = {}
    for page_id in page_ids:
        
        current_id = page_id

        # Fetch the current page details
        page = confluence.get_page_by_id(current_id, expand='ancestors')
        
        # Check if there are ancestors
        ancestors = page.get('ancestors', [])
        temp_list = []
        for ancestor in ancestors:
            temp_list.append(ancestor["title"])
        parent_titles[current_id] = temp_list           




    return parent_titles

def get_hiearchy_space(docs, confluence_url, username, api_key):
    docs_ids = []
    for doc in docs:
        docs_ids.append(doc.metadata["id"])

    #add how to get the tree
    hiearchy = get_all_parent_titles_dict(confluence_url, username, api_key, docs_ids)

    return hiearchy

def get_index(name: str) -> SearchIndex:
    """
    Returns an Azure Cognitive Search index with the given name.
    """
    # The fields we want to index. The "embedding" field is a vector field that will
    # be used for vector search.
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
            # Size of the vector created by the text-embedding-ada-002 model.
            vector_search_dimensions=1536,
            vector_search_configuration="default",
        ),
    ]

    # The "content" field should be prioritized for semantic ranking.
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

    # For vector search, we want to use the HNSW (Hierarchical Navigable Small World)
    # algorithm (a type of approximate nearest neighbor search algorithm) with cosine
    # distance.
    vector_search = VectorSearch(
        algorithm_configurations=[
            HnswVectorSearchAlgorithmConfiguration(
                name="default",
                kind="hnsw",
                parameters=HnswParameters(metric="cosine"),
            )
        ]
    )

    # Create the search index.
    index = SearchIndex(
        name=name,
        fields=fields,
        semantic_settings=semantic_settings,
        vector_search=vector_search,
    )

    return index

def format_hierarchy(page_id, page_tree):
    """
    Formats the hierarchy into a string from the list of ancestors.
    """
    if page_id in page_tree:
        return ' > '.join(page_tree[page_id][::-1])  # Reverse to start from the root
    return "No hierarchy available"

def augment_content_with_hierarchy(content: str, hierarchy: str, date: str) -> str:
    """
    Augments content with hierarchy and date information.
    """
    hierarchy_info = f"This is the page hierarchy of the content: {hierarchy}"
    date_info = f"Published on: {date}"
    return f"{hierarchy_info}\n{date_info}\n\n{content}"


def main(args):
    AZURE_SEARCH_ENDPOINT = os.environ['AZURE_SEARCH_ENDPOINT']
    AZURE_SEARCH_KEY = os.environ['AZURE_SEARCH_KEY']
    AZURE_SEARCH_INDEX_NAME = "hicovault"


    clientOpenAI = AzureOpenAI(
    azure_endpoint = os.environ['AZURE_OPENAI_ENDPOINT'], 
    api_key=os.environ['AZURE_OPENAI_KEY'],  
    api_version="2024-02-15-preview"
    )

    confluence_url = "https://hicogroupconfluence.atlassian.net"
    username = "aziz.raies@hico-group.com"
    api_key = os.environ['CONFLUENCE_API_KEY']
    space_key = args.confluence_space
    search_index_client = SearchIndexClient(AZURE_SEARCH_ENDPOINT, AzureKeyCredential(AZURE_SEARCH_KEY))

    docs = load_from_confluence_loader(confluence_url, username, api_key, space_key)
    page_tree = get_hiearchy_space(docs, confluence_url, username, api_key )
    # Split data into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 5000,
        chunk_overlap  = 20,
        length_function = len
    )
    chunks = text_splitter.split_documents(docs)
    datas = []
    # Store the data into Azure search index
    for index, chunk in enumerate(chunks):
        hierarchy = format_hierarchy(chunk.metadata["id"], page_tree)
        augmented_content = augment_content_with_hierarchy(chunk.page_content, hierarchy, chunk.metadata['when'][:10])
        data = {
            "id" : str(index + 1),
            "content" : augmented_content,
            "sourcefile": chunk.metadata["source"],
            "title": chunk.metadata['title'],
            "date": chunk.metadata['when'][:10],
            "access_level": 1,
        }
        datas.append(data)

    for doc in datas:
        doc["embedding"] = clientOpenAI.embeddings.create(input = doc["content"], model="embedding-rag-confluence").data[0].embedding

    # Create an Azure Cognitive Search index.
    index = get_index(AZURE_SEARCH_INDEX_NAME)
    search_index_client.create_or_update_index(index)

    # Upload our data to the index.
    search_client = SearchClient(
        endpoint=AZURE_SEARCH_ENDPOINT,
        index_name=AZURE_SEARCH_INDEX_NAME,
        credential=AzureKeyCredential(AZURE_SEARCH_KEY),
    )
    search_client.upload_documents(datas)


if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--confluence_space", type=str, default="tckb", help="name of the confluence space to be processed.")
    args = parser.parse_args()
    main(args)