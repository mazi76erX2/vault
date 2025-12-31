import os
import argparse
from logging import config
from typing import List, Dict
from langchain_community.document_loaders import ConfluenceLoader
from atlassian import Confluence, Jira
from langchain.text_splitter import RecursiveCharacterTextSplitter
import gradio as gr

from app.connectors.store_data_in_kb import (
    store_confluence_in_qdrant,
    store_in_qdrant,
)


def fn_connect_confluence(url, user, api, keyspace, index):
    store_confluence_in_qdrant(url, user, api, keyspace, collection_name=index)
    gr.Info("Confluence Documents stored in the Knowledge Base")
    return (
        gr.Textbox(""),
        gr.Textbox(""),
        gr.Textbox(""),
        gr.Textbox(""),
        gr.Textbox(""),
    )


def fn_connect_sharepoint(hostname, sitepath, index):
    from app.connectors.store_data_in_kb import store_in_qdrant as _s

    gr.Info("SharePoint Documents stored in the Knowledge Base")
    return gr.Textbox(""), gr.Textbox(""), gr.Textbox("")


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


def main(args):
    confluence_url = "https://groupconfluence.atlassian.net"
    username = os.environ.get("CONFLUENCE_USER", "")
    api_key = os.environ.get("CONFLUENCE_API_KEY", "")
    space_key = args.confluence_space
    collection_name = os.environ.get("QDRANT_COLLECTION", "vault")

    store_confluence_in_qdrant(
        confluence_url, username, api_key, space_key, collection_name=collection_name
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--confluence_space",
        type=str,
        default="tckb",
        help="name of the confluence space to be processed.",
    )
    args = parser.parse_args()
    main(args)
