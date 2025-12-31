"""
store_data_in_kb.py - Knowledge Base Storage Module
Handles document ingestion into Qdrant vector database using Ollama embeddings
Replaces Azure Search with local-first architecture
"""

import logging
import os
import uuid
from typing import Dict, List, Optional
from datetime import datetime

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import requests

logger = logging.getLogger(__name__)

# Configuration
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")
QDRANT_HOST = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))
QDRANT_COLLECTION = os.environ.get("QDRANT_COLLECTION", "hicovault")

# Initialize Qdrant client
qdrant_client = QdrantClient(url=f"http://{QDRANT_HOST}:{QDRANT_PORT}")


def _get_embedding(text: str) -> List[float]:
    """
    Generate embedding for text using Ollama.

    Args:
        text: Text to embed

    Returns:
        Embedding vector as list of floats
    """
    try:
        url = f"{OLLAMA_HOST.rstrip('/')}/api/embed"
        payload = {"model": OLLAMA_EMBED_MODEL, "input": [text]}
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, dict) and "embeddings" in data:
            return data["embeddings"][0]
        if isinstance(data, dict) and "embedding" in data:
            return data["embedding"]
        if isinstance(data, list) and len(data) > 0:
            return data[0]

        raise RuntimeError(f"Unexpected Ollama embed response: {type(data)}")
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


def ensure_collection_exists(collection_name: str = QDRANT_COLLECTION, vector_size: int = 768):
    """
    Ensure the Qdrant collection exists, create if it doesn't.

    Args:
        collection_name: Name of the collection
        vector_size: Dimension of the embedding vectors (768 for nomic-embed-text)
    """
    try:
        collections = qdrant_client.get_collections()
        collection_names = [col.name for col in collections.collections]

        if collection_name not in collection_names:
            logger.info(f"Creating Qdrant collection: {collection_name}")
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )
            logger.info(f"Collection {collection_name} created successfully")
        else:
            logger.info(f"Collection {collection_name} already exists")
    except Exception as e:
        logger.error(f"Error ensuring collection exists: {e}")
        raise


def store_in_kb(doc: Dict) -> Dict:
    """
    Store a document in the Qdrant knowledge base.

    Args:
        doc: Dictionary containing document data with keys:
            - file_name: Source file name or URL
            - content: Document text content
            - file_title: Title of the document
            - level: Access level (1-5)
            - Optional metadata fields

    Returns:
        Dictionary with status and document ID
    """
    try:
        logger.info(f"Storing document: {doc.get('file_title', 'Untitled')}")

        # Ensure collection exists
        ensure_collection_exists()

        # Extract document data
        content = doc.get("content", "")
        if not content:
            raise ValueError("Document content is empty")

        file_name = doc.get("file_name", "unknown")
        file_title = doc.get("file_title", "Untitled")
        access_level = doc.get("level", 1)

        # Generate embedding
        logger.info("Generating embedding for document...")
        embedding = _get_embedding(content)

        # Create unique ID
        doc_id = str(uuid.uuid4())

        # Prepare metadata payload
        payload = {
            "content": content,
            "sourcefile": file_name,
            "source": file_name,  # Alias for compatibility
            "title": file_title,
            "name": file_title,  # Alias for compatibility
            "access_level": access_level,
            "access": access_level,  # Alias for compatibility
            "last_modified_date": datetime.now().isoformat(),
            "date": datetime.now().isoformat(),  # Alias for compatibility
            "doc_id": doc_id,
        }

        # Add any additional metadata from doc
        for key, value in doc.items():
            if key not in ["content", "file_name", "file_title", "level"]:
                payload[key] = value

        # Create point for Qdrant
        point = PointStruct(
            id=doc_id,
            vector=embedding,
            payload=payload
        )

        # Upsert into Qdrant
        logger.info(f"Upserting document into Qdrant collection: {QDRANT_COLLECTION}")
        qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=[point]
        )

        logger.info(f"Document stored successfully with ID: {doc_id}")

        return {
            "status": "success",
            "message": "Document stored in knowledge base",
            "doc_id": doc_id,
            "collection": QDRANT_COLLECTION
        }

    except Exception as e:
        logger.error(f"Error storing document in knowledge base: {e}")
        return {
            "status": "error",
            "message": f"Failed to store document: {str(e)}"
        }


def store_bulk_in_kb(docs: List[Dict]) -> Dict:
    """
    Store multiple documents in the knowledge base in a batch.

    Args:
        docs: List of document dictionaries (same format as store_in_kb)

    Returns:
        Dictionary with status and count of stored documents
    """
    try:
        logger.info(f"Bulk storing {len(docs)} documents")

        # Ensure collection exists
        ensure_collection_exists()

        points = []
        doc_ids = []

        for doc in docs:
            try:
                content = doc.get("content", "")
                if not content:
                    logger.warning(f"Skipping document with empty content: {doc.get('file_title')}")
                    continue

                # Generate embedding
                embedding = _get_embedding(content)

                # Create unique ID
                doc_id = str(uuid.uuid4())
                doc_ids.append(doc_id)

                # Prepare payload
                payload = {
                    "content": content,
                    "sourcefile": doc.get("file_name", "unknown"),
                    "source": doc.get("file_name", "unknown"),
                    "title": doc.get("file_title", "Untitled"),
                    "name": doc.get("file_title", "Untitled"),
                    "access_level": doc.get("level", 1),
                    "access": doc.get("level", 1),
                    "last_modified_date": datetime.now().isoformat(),
                    "date": datetime.now().isoformat(),
                    "doc_id": doc_id,
                }

                # Add extra metadata
                for key, value in doc.items():
                    if key not in ["content", "file_name", "file_title", "level"]:
                        payload[key] = value

                # Create point
                point = PointStruct(
                    id=doc_id,
                    vector=embedding,
                    payload=payload
                )
                points.append(point)

            except Exception as e:
                logger.error(f"Error processing document {doc.get('file_title')}: {e}")
                continue

        if not points:
            return {
                "status": "error",
                "message": "No valid documents to store"
            }

        # Batch upsert
        logger.info(f"Upserting {len(points)} documents into Qdrant")
        qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=points
        )

        logger.info(f"Bulk storage complete: {len(points)} documents stored")

        return {
            "status": "success",
            "message": f"Stored {len(points)} documents in knowledge base",
            "doc_ids": doc_ids,
            "collection": QDRANT_COLLECTION
        }

    except Exception as e:
        logger.error(f"Error in bulk storage: {e}")
        return {
            "status": "error",
            "message": f"Bulk storage failed: {str(e)}"
        }


def delete_from_kb(doc_id: str) -> Dict:
    """
    Delete a document from the knowledge base.

    Args:
        doc_id: ID of the document to delete

    Returns:
        Dictionary with status
    """
    try:
        logger.info(f"Deleting document: {doc_id}")

        qdrant_client.delete(
            collection_name=QDRANT_COLLECTION,
            points_selector=[doc_id]
        )

        logger.info(f"Document {doc_id} deleted successfully")

        return {
            "status": "success",
            "message": "Document deleted from knowledge base"
        }

    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        return {
            "status": "error",
            "message": f"Failed to delete document: {str(e)}"
        }


def search_kb(query: str, limit: int = 5, access_level: int = 1) -> List[Dict]:
    """
    Search the knowledge base for similar documents.

    Args:
        query: Search query text
        limit: Maximum number of results
        access_level: User's access level for filtering

    Returns:
        List of matching documents with scores
    """
    try:
        logger.info(f"Searching knowledge base for: {query}")

        # Generate query embedding
        query_embedding = _get_embedding(query)

        # Search Qdrant
        results = qdrant_client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=query_embedding,
            limit=limit * 2,  # Get more to filter by access level
        )

        # Filter by access level and format results
        filtered_results = []
        for result in results:
            payload = result.payload
            doc_access_level = payload.get("access_level", payload.get("access", 1))

            if doc_access_level <= access_level:
                filtered_results.append({
                    "id": result.id,
                    "score": result.score,
                    "content": payload.get("content", ""),
                    "title": payload.get("title", payload.get("name", "")),
                    "source": payload.get("sourcefile", payload.get("source", "")),
                    "access_level": doc_access_level,
                    "metadata": payload
                })

            if len(filtered_results) >= limit:
                break

        logger.info(f"Found {len(filtered_results)} matching documents")
        return filtered_results

    except Exception as e:
        logger.error(f"Error searching knowledge base: {e}")
        return []


# Backward compatibility aliases
store_in_azure_kb = store_in_kb  # Deprecated alias
