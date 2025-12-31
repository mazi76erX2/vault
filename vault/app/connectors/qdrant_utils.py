"""Utilities for creating Qdrant collections and upserting documents.

This module is used by ingestion/migration scripts to create collections sized to
match the embedding dimension returned by the local Ollama instance and to upsert
points into Qdrant.

Note: Keep this logic lightweight to avoid adding extra external dependencies.
"""

import logging
import os
import uuid

import requests
from qdrant_client import QdrantClient

logger = logging.getLogger(__name__)

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama2")
QDRANT_HOST = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))


def _ollama_embed(texts):
    """Embed list of texts via Ollama HTTP embed endpoint."""
    url = f"{OLLAMA_HOST.rstrip('/')}/api/embed"
    payload = {"model": OLLAMA_MODEL, "input": texts}
    resp = requests.post(url, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, dict) and "embeddings" in data:
        return data["embeddings"]
    if isinstance(data, dict) and "output" in data:
        return data["output"]
    if isinstance(data, list):
        return data
    raise RuntimeError("Unexpected Ollama embed response")


def get_embedding_dim():
    """Return embedding dimensionality by asking Ollama to embed a short string."""
    emb = _ollama_embed(["test"])
    return len(emb[0])


def get_qdrant_client():
    return QdrantClient(url=f"http://{QDRANT_HOST}:{QDRANT_PORT}")


def recreate_collection(collection_name: str):
    client = get_qdrant_client()
    dim = get_embedding_dim()
    # Recreate collection (drop if exists)
    try:
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config={"size": dim, "distance": "Cosine"},
        )
        logger.info(f"Created qdrant collection '{collection_name}' with dim {dim}")
    except Exception as e:
        logger.error(f"Failed to create/recreate collection {collection_name}: {e}")
        raise


def upsert_documents(collection_name: str, documents: list):
    """Upsert a list of documents into Qdrant.

    Each document should be a dict with at least: id (str), content (str), and optional metadata.
    """
    client = get_qdrant_client()
    # Prepare points for upsert
    texts = [d.get("content", "") for d in documents]
    embeddings = _ollama_embed(texts)
    points = []
    for d, emb in zip(documents, embeddings, strict=False):
        point = {
            "id": d.get("id") or str(uuid.uuid4()),
            "vector": emb,
            "payload": d.get("metadata", {}),
        }
        # include a copy of content in payload so retrieval returns it
        point["payload"].setdefault("content", d.get("content", ""))
        points.append(point)
    # Upsert into Qdrant
    client.upsert(collection_name=collection_name, points=points)
    logger.info(f"Upserted {len(points)} documents into '{collection_name}'")
