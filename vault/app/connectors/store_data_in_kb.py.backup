from typing import List, Dict

import os
import logging

# gradio removed
from datetime import datetime
import hashlib
import json
from pathlib import Path as _Path

from langchain_community.document_loaders import ConfluenceLoader
from atlassian import Confluence

# Ollama + Qdrant
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.text_splitter import CharacterTextSplitter

# Azure-specific index imports removed
from app.connectors.sharepoint_client import SharePointClient
from app.connectors.qdrant_utils import (
    upsert_documents,
    recreate_collection,
    get_qdrant_client,
    _ollama_embed,
)
from pathlib import Path
from dotenv import load_dotenv
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter

# sentence_transformers removed
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

LOCAL_KB_PATH = os.environ.get("LOCAL_KB_PATH", "./kb_local")


def _ensure_local_kb_dir():
    p = _Path(LOCAL_KB_PATH)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _save_points_locally(collection_name: str, points: List[dict]):
    """Append points to a newline-delimited JSON file for the collection.

    Each line is a JSON object with keys: id, content, metadata, saved_at.
    """
    try:
        _ensure_local_kb_dir()
        out_file = _Path(LOCAL_KB_PATH) / f"{collection_name}.jsonl"
        with out_file.open("a", encoding="utf-8") as fh:
            for pt in points:
                record = {
                    "id": pt.get("id"),
                    "content": pt.get("content", ""),
                    "metadata": pt.get("metadata", {}),
                    "saved_at": datetime.now().isoformat(),
                }
                fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        logging.debug(f"Saved {len(points)} points to local KB file {out_file}")
    except Exception as e:
        logging.error(f"Failed to save points locally for '{collection_name}': {e}")


def dump_qdrant_collection_to_disk(collection_name: str, out_path: str = None):
    """Fetch points from Qdrant and write them to a local JSONL file.

    This is a snapshot and may be used for backups or offline inspection.
    """
    try:
        client = get_qdrant_client()
        out_dir = _ensure_local_kb_dir()
        out_file = (
            _Path(out_path)
            if out_path
            else out_dir / f"{collection_name}_snapshot.jsonl"
        )
        # Attempt to scroll through collection (page through results)
        batch = 100
        offset = 0
        total_written = 0
        with out_file.open("w", encoding="utf-8") as fh:
            while True:
                try:
                    resp = client.scroll(
                        collection_name=collection_name, limit=batch, offset=offset
                    )
                except Exception:
                    # Fallback: try with 'limit' only (older client versions)
                    try:
                        resp = client.scroll(
                            collection_name=collection_name, limit=batch
                        )
                    except Exception as e:
                        logging.error(f"Failed to scroll Qdrant collection: {e}")
                        break

                points = getattr(resp, "points", None) or resp.get("points", [])
                if not points:
                    break
                for p in points:
                    payload = getattr(p, "payload", None) or p.get("payload", {})
                    rec = {
                        "id": getattr(p, "id", None) or p.get("id"),
                        "payload": payload,
                    }
                    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    total_written += 1
                if len(points) < batch:
                    break
                offset += len(points)
        logging.info(
            f"Dumped {total_written} points from Qdrant collection '{collection_name}' to {out_file}"
        )
        return str(out_file)
    except Exception as e:
        logging.error(f"Error dumping Qdrant collection to disk: {e}")
        return None


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


def ensure_collection_exists(collection_name: str):
    """Create the Qdrant collection only if it does not already exist."""
    client = get_qdrant_client()
    try:
        cols_resp = client.get_collections()
        cols = cols_resp.get("collections", []) if isinstance(cols_resp, dict) else []
        names = [c.get("name") for c in cols if isinstance(c, dict)]
    except Exception:
        # Fallback if client returns different shape
        try:
            names = [c.name for c in client.get_collections().collections]
        except Exception:
            names = []
    if collection_name not in names:
        logging.info(
            f"Creating qdrant collection '{collection_name}' because it does not exist."
        )
        recreate_collection(collection_name)
    else:
        logging.debug(
            f"Qdrant collection '{collection_name}' already exists. Skipping recreate."
        )


# New: ingest Confluence content directly into Qdrant using Ollama for embeddings
def store_confluence_in_qdrant(
    confluence_url, username, api_key, space_key, collection_name="hicovault"
):
    docs = load_from_confluence_loader(confluence_url, username, api_key, space_key)
    page_tree = get_hiearchy_space(docs, confluence_url, username, api_key)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=5000, chunk_overlap=20, length_function=len
    )
    chunks = text_splitter.split_documents(docs)

    points = []
    doc_counter = None
    chunk_counter = 0

    for chunk in chunks:
        hierarchy = format_hierarchy(chunk.metadata["id"], page_tree)
        augmented_content = augment_content_with_hierarchy(
            chunk.page_content, hierarchy, chunk.metadata["when"][:10]
        )
        doc_id = generate_doc_id(chunk.metadata["title"], chunk.metadata["source"])
        if doc_id == doc_counter:
            chunk_counter += 1
        else:
            doc_counter = doc_id
            chunk_counter = 0
        chunk_id = f"{doc_id}_chunk_{chunk_counter}"
        point = {
            "id": chunk_id,
            "content": augmented_content,
            "metadata": {
                "sourcefile": chunk.metadata.get("source", ""),
                "title": chunk.metadata.get("title", ""),
                "last_modified_date": chunk.metadata.get("when", "")[:10],
                "access_level": 1,
            },
        }
        points.append(point)

    # Persist locally first (so we have a local copy regardless of Qdrant state)
    try:
        _save_points_locally(collection_name, points)
    except Exception:
        logging.exception("Local save failed for confluence points")

    # Ensure collection exists (create only if missing) and upsert using qdrant_utils which will call Ollama for embeddings
    ensure_collection_exists(collection_name)
    upsert_documents(collection_name, points)
    logging.info(
        f"Upserted {len(points)} points into Qdrant collection '{collection_name}'"
    )


# Convenience wrapper for single-document ingestion
def store_in_qdrant(doc, collection_name="hicovault"):
    # doc expected: {"file_name", "content", "file_title", "level"}
    point = {
        "id": doc.get("file_name") or str(uuid.uuid4()),
        "content": doc.get("content", ""),
        "metadata": {
            "sourcefile": doc.get("file_name", ""),
            "title": doc.get("file_title", ""),
            "last_modified_date": doc.get("created_date", ""),
            "access_level": doc.get("level", 1),
        },
    }
    # Persist locally before upsert
    try:
        _save_points_locally(collection_name, [point])
    except Exception:
        logging.exception("Local save failed for single doc")

    # Ensure collection exists but do not recreate if present
    ensure_collection_exists(collection_name)
    upsert_documents(collection_name, [point])
    logging.info(
        f"Stored document {point['id']} in Qdrant collection '{collection_name}'"
    )


# Compatibility wrappers (preserve existing call sites)


def store_confluence_in_azure_kb(confluence_url, username, api_key, space_key, index):
    logging.warning(
        "store_confluence_in_azure_kb is deprecated; routing to Qdrant ingestion."
    )
    return store_confluence_in_qdrant(
        confluence_url, username, api_key, space_key, collection_name=index
    )


def store_in_azure_kb(doc):
    logging.warning("store_in_azure_kb is deprecated; routing to Qdrant ingestion.")
    return store_in_qdrant(
        doc, collection_name=os.environ.get("QDRANT_COLLECTION", "hicovault")
    )


# End of file
