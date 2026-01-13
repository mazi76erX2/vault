"""
store_data_in_kb.py - Knowledge Base Storage Module
Handles document ingestion into PostgreSQL with pgvector using Ollama embeddings
Replaces Azure Search and Qdrant with pgvector for local-first architecture
"""

import logging
import os
import uuid
from datetime import datetime

import requests
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

logger = logging.getLogger(__name__)

# Configuration
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")
EMBEDDING_DIMENSION = int(os.environ.get("EMBEDDING_DIMENSION", "768"))

# Database setup
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ============================================================================
# SQLAlchemy Model for Knowledge Base Documents
# ============================================================================


class KnowledgeBaseDocument(Base):
    """Knowledge base document with vector embedding"""

    __tablename__ = "kb_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(EMBEDDING_DIMENSION), nullable=True)

    # Document metadata
    sourcefile = Column(String(500), nullable=True)
    title = Column(String(500), nullable=True)
    access_level = Column(Integer, default=1, index=True)

    # Additional metadata
    company_id = Column(Integer, nullable=True, index=True)
    company_reg_no = Column(String(50), nullable=True, index=True)
    department = Column(String(100), nullable=True)
    tags = Column(Text, nullable=True)  # Comma-separated tags
    author = Column(String(255), nullable=True)
    doc_type = Column(String(50), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_modified_date = Column(DateTime, default=datetime.utcnow)


# ============================================================================
# Database Initialization
# ============================================================================


def init_pgvector():
    """Initialize pgvector extension and create tables"""
    with engine.connect() as conn:
        # Enable pgvector extension
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("pgvector extension enabled and tables created")


def get_db_session():
    """Get a database session"""
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise


# ============================================================================
# Embedding Generation
# ============================================================================


def _get_embedding(text_content: str) -> list[float]:
    """
    Generate embedding for text using Ollama.

    Args:
        text_content: Text to embed

    Returns:
        Embedding vector as list of floats
    """
    try:
        url = f"{OLLAMA_HOST.rstrip('/')}/api/embed"
        payload = {"model": OLLAMA_EMBED_MODEL, "input": [text_content]}
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


def _get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple texts using Ollama.

    Args:
        texts: List of texts to embed

    Returns:
        List of embedding vectors
    """
    try:
        url = f"{OLLAMA_HOST.rstrip('/')}/api/embed"
        payload = {"model": OLLAMA_EMBED_MODEL, "input": texts}
        resp = requests.post(url, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, dict) and "embeddings" in data:
            return data["embeddings"]
        if isinstance(data, list):
            return data

        raise RuntimeError(f"Unexpected Ollama embed response: {type(data)}")
    except Exception as e:
        logger.error(f"Failed to generate batch embeddings: {e}")
        raise


# ============================================================================
# Knowledge Base Operations
# ============================================================================


def store_in_kb(doc: dict) -> dict:
    """
    Store a document in the pgvector knowledge base.

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
    db = None
    try:
        logger.info(f"Storing document: {doc.get('file_title', 'Untitled')}")

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
        doc_id = uuid.uuid4()

        # Create document record
        kb_doc = KnowledgeBaseDocument(
            id=doc_id,
            content=content,
            embedding=embedding,
            sourcefile=file_name,
            title=file_title,
            access_level=access_level,
            company_id=doc.get("company_id"),
            company_reg_no=doc.get("company_reg_no"),
            department=doc.get("department"),
            tags=doc.get("tags"),
            author=doc.get("author"),
            doc_type=doc.get("doc_type"),
            last_modified_date=datetime.now(),
        )

        # Store in database
        db = get_db_session()
        db.add(kb_doc)
        db.commit()

        logger.info(f"Document stored successfully with ID: {doc_id}")

        return {
            "status": "success",
            "message": "Document stored in knowledge base",
            "doc_id": str(doc_id),
        }

    except Exception as e:
        logger.error(f"Error storing document in knowledge base: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Failed to store document: {str(e)}"}
    finally:
        if db:
            db.close()


def store_bulk_in_kb(docs: list[dict]) -> dict:
    """
    Store multiple documents in the knowledge base in a batch.

    Args:
        docs: List of document dictionaries (same format as store_in_kb)

    Returns:
        Dictionary with status and count of stored documents
    """
    db = None
    try:
        logger.info(f"Bulk storing {len(docs)} documents")

        # Filter documents with content
        valid_docs = [doc for doc in docs if doc.get("content")]
        if not valid_docs:
            return {"status": "error", "message": "No valid documents to store"}

        # Generate embeddings in batch
        contents = [doc["content"] for doc in valid_docs]
        logger.info(f"Generating embeddings for {len(contents)} documents...")
        embeddings = _get_embeddings_batch(contents)

        # Create document records
        kb_docs = []
        doc_ids = []

        for i, doc in enumerate(valid_docs):
            doc_id = uuid.uuid4()
            doc_ids.append(str(doc_id))

            kb_doc = KnowledgeBaseDocument(
                id=doc_id,
                content=doc.get("content", ""),
                embedding=embeddings[i],
                sourcefile=doc.get("file_name", "unknown"),
                title=doc.get("file_title", "Untitled"),
                access_level=doc.get("level", 1),
                company_id=doc.get("company_id"),
                company_reg_no=doc.get("company_reg_no"),
                department=doc.get("department"),
                tags=doc.get("tags"),
                author=doc.get("author"),
                doc_type=doc.get("doc_type"),
                last_modified_date=datetime.now(),
            )
            kb_docs.append(kb_doc)

        # Bulk insert
        db = get_db_session()
        db.add_all(kb_docs)
        db.commit()

        logger.info(f"Bulk storage complete: {len(kb_docs)} documents stored")

        return {
            "status": "success",
            "message": f"Stored {len(kb_docs)} documents in knowledge base",
            "doc_ids": doc_ids,
        }

    except Exception as e:
        logger.error(f"Error in bulk storage: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Bulk storage failed: {str(e)}"}
    finally:
        if db:
            db.close()


def delete_from_kb(doc_id: str) -> dict:
    """
    Delete a document from the knowledge base.

    Args:
        doc_id: ID of the document to delete

    Returns:
        Dictionary with status
    """
    db = None
    try:
        logger.info(f"Deleting document: {doc_id}")

        db = get_db_session()
        doc = db.query(KnowledgeBaseDocument).filter(KnowledgeBaseDocument.id == doc_id).first()

        if not doc:
            return {"status": "error", "message": "Document not found"}

        db.delete(doc)
        db.commit()

        logger.info(f"Document {doc_id} deleted successfully")

        return {"status": "success", "message": "Document deleted from knowledge base"}

    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Failed to delete document: {str(e)}"}
    finally:
        if db:
            db.close()


def delete_bulk_from_kb(doc_ids: list[str]) -> dict:
    """
    Delete multiple documents from the knowledge base.

    Args:
        doc_ids: List of document IDs to delete

    Returns:
        Dictionary with status and count of deleted documents
    """
    db = None
    try:
        logger.info(f"Bulk deleting {len(doc_ids)} documents")

        db = get_db_session()
        deleted_count = (
            db.query(KnowledgeBaseDocument)
            .filter(KnowledgeBaseDocument.id.in_(doc_ids))
            .delete(synchronize_session=False)
        )
        db.commit()

        logger.info(f"Deleted {deleted_count} documents")

        return {
            "status": "success",
            "message": f"Deleted {deleted_count} documents from knowledge base",
            "deleted_count": deleted_count,
        }

    except Exception as e:
        logger.error(f"Error in bulk delete: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Bulk delete failed: {str(e)}"}
    finally:
        if db:
            db.close()


def search_kb(
    query: str,
    limit: int = 5,
    access_level: int = 1,
    company_id: int | None = None,
    company_reg_no: str | None = None,
    department: str | None = None,
    similarity_threshold: float = 0.5,
) -> list[dict]:
    """
    Search the knowledge base for similar documents using pgvector.

    Args:
        query: Search query text
        limit: Maximum number of results
        access_level: User's access level for filtering
        company_id: Optional company ID filter
        company_reg_no: Optional company registration number filter
        department: Optional department filter
        similarity_threshold: Minimum similarity score (0-1)

    Returns:
        List of matching documents with scores
    """
    db = None
    try:
        logger.info(f"Searching knowledge base for: {query}")

        # Generate query embedding
        query_embedding = _get_embedding(query)

        db = get_db_session()

        # Build the similarity search query using pgvector's cosine distance
        # Note: pgvector uses distance, so we convert to similarity (1 - distance)
        query_sql = text(
            """
            SELECT
                id,
                content,
                sourcefile,
                title,
                access_level,
                company_id,
                company_reg_no,
                department,
                tags,
                author,
                doc_type,
                created_at,
                last_modified_date,
                1 - (embedding <=> :query_embedding::vector) as similarity
            FROM kb_documents
            WHERE access_level <= :access_level
            AND (1 - (embedding <=> :query_embedding::vector)) >= :similarity_threshold
            AND (:company_id IS NULL OR company_id = :company_id)
            AND (:company_reg_no IS NULL OR company_reg_no = :company_reg_no)
            AND (:department IS NULL OR department = :department)
            ORDER BY embedding <=> :query_embedding::vector
            LIMIT :limit
        """
        )

        results = db.execute(
            query_sql,
            {
                "query_embedding": str(query_embedding),
                "access_level": access_level,
                "similarity_threshold": similarity_threshold,
                "company_id": company_id,
                "company_reg_no": company_reg_no,
                "department": department,
                "limit": limit,
            },
        ).fetchall()

        # Format results
        formatted_results = []
        for row in results:
            formatted_results.append(
                {
                    "id": str(row.id),
                    "score": float(row.similarity),
                    "content": row.content,
                    "title": row.title,
                    "source": row.sourcefile,
                    "sourcefile": row.sourcefile,
                    "access_level": row.access_level,
                    "company_id": row.company_id,
                    "company_reg_no": row.company_reg_no,
                    "department": row.department,
                    "tags": row.tags,
                    "author": row.author,
                    "doc_type": row.doc_type,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "last_modified_date": (
                        row.last_modified_date.isoformat() if row.last_modified_date else None
                    ),
                    "metadata": {
                        "title": row.title,
                        "sourcefile": row.sourcefile,
                        "access_level": row.access_level,
                        "company_id": row.company_id,
                        "department": row.department,
                        "tags": row.tags,
                    },
                }
            )

        logger.info(f"Found {len(formatted_results)} matching documents")
        return formatted_results

    except Exception as e:
        logger.error(f"Error searching knowledge base: {e}")
        return []
    finally:
        if db:
            db.close()


def search_kb_hybrid(
    query: str,
    limit: int = 5,
    access_level: int = 1,
    company_id: int | None = None,
    keyword_weight: float = 0.3,
    semantic_weight: float = 0.7,
) -> list[dict]:
    """
    Hybrid search combining semantic similarity and keyword matching.

    Args:
        query: Search query text
        limit: Maximum number of results
        access_level: User's access level for filtering
        company_id: Optional company ID filter
        keyword_weight: Weight for keyword matching (0-1)
        semantic_weight: Weight for semantic similarity (0-1)

    Returns:
        List of matching documents with combined scores
    """
    db = None
    try:
        logger.info(f"Hybrid searching knowledge base for: {query}")

        # Generate query embedding
        query_embedding = _get_embedding(query)

        db = get_db_session()

        # Hybrid search using both vector similarity and text search
        query_sql = text(
            """
            WITH semantic_search AS (
                SELECT
                    id,
                    1 - (embedding <=> :query_embedding::vector) as semantic_score
                FROM kb_documents
                WHERE access_level <= :access_level
                AND (:company_id IS NULL OR company_id = :company_id)
            ),
            keyword_search AS (
                SELECT
                    id,
                    ts_rank(
                        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')),
                        plainto_tsquery('english', :query)
                    ) as keyword_score
                FROM kb_documents
                WHERE access_level <= :access_level
                AND (:company_id IS NULL OR company_id = :company_id)
            )
            SELECT
                d.id,
                d.content,
                d.sourcefile,
                d.title,
                d.access_level,
                d.company_id,
                d.company_reg_no,
                d.department,
                d.tags,
                d.author,
                d.doc_type,
                d.created_at,
                d.last_modified_date,
                COALESCE(s.semantic_score, 0) as semantic_score,
                COALESCE(k.keyword_score, 0) as keyword_score,
                (COALESCE(s.semantic_score, 0) * :semantic_weight +
                 COALESCE(k.keyword_score, 0) * :keyword_weight) as combined_score
            FROM kb_documents d
            LEFT JOIN semantic_search s ON d.id = s.id
            LEFT JOIN keyword_search k ON d.id = k.id
            WHERE d.access_level <= :access_level
            AND (:company_id IS NULL OR d.company_id = :company_id)
            ORDER BY combined_score DESC
            LIMIT :limit
        """
        )

        results = db.execute(
            query_sql,
            {
                "query_embedding": str(query_embedding),
                "query": query,
                "access_level": access_level,
                "company_id": company_id,
                "semantic_weight": semantic_weight,
                "keyword_weight": keyword_weight,
                "limit": limit,
            },
        ).fetchall()

        # Format results
        formatted_results = []
        for row in results:
            formatted_results.append(
                {
                    "id": str(row.id),
                    "score": float(row.combined_score),
                    "semantic_score": float(row.semantic_score),
                    "keyword_score": float(row.keyword_score),
                    "content": row.content,
                    "title": row.title,
                    "source": row.sourcefile,
                    "sourcefile": row.sourcefile,
                    "access_level": row.access_level,
                    "company_id": row.company_id,
                    "company_reg_no": row.company_reg_no,
                    "department": row.department,
                    "tags": row.tags,
                    "author": row.author,
                    "doc_type": row.doc_type,
                    "metadata": {
                        "title": row.title,
                        "sourcefile": row.sourcefile,
                        "access_level": row.access_level,
                    },
                }
            )

        logger.info(f"Hybrid search found {len(formatted_results)} matching documents")
        return formatted_results

    except Exception as e:
        logger.error(f"Error in hybrid search: {e}")
        return []
    finally:
        if db:
            db.close()


def get_document_by_id(doc_id: str) -> dict | None:
    """
    Retrieve a document by its ID.

    Args:
        doc_id: Document ID

    Returns:
        Document data or None if not found
    """
    db = None
    try:
        db = get_db_session()
        doc = db.query(KnowledgeBaseDocument).filter(KnowledgeBaseDocument.id == doc_id).first()

        if not doc:
            return None

        return {
            "id": str(doc.id),
            "content": doc.content,
            "title": doc.title,
            "sourcefile": doc.sourcefile,
            "access_level": doc.access_level,
            "company_id": doc.company_id,
            "company_reg_no": doc.company_reg_no,
            "department": doc.department,
            "tags": doc.tags,
            "author": doc.author,
            "doc_type": doc.doc_type,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "last_modified_date": (
                doc.last_modified_date.isoformat() if doc.last_modified_date else None
            ),
        }

    except Exception as e:
        logger.error(f"Error getting document: {e}")
        return None
    finally:
        if db:
            db.close()


def update_document(doc_id: str, updates: dict) -> dict:
    """
    Update a document's metadata (content update regenerates embedding).

    Args:
        doc_id: Document ID
        updates: Dictionary of fields to update

    Returns:
        Dictionary with status
    """
    db = None
    try:
        logger.info(f"Updating document: {doc_id}")

        db = get_db_session()
        doc = db.query(KnowledgeBaseDocument).filter(KnowledgeBaseDocument.id == doc_id).first()

        if not doc:
            return {"status": "error", "message": "Document not found"}

        # Update fields
        for key, value in updates.items():
            if hasattr(doc, key) and key not in ["id", "embedding", "created_at"]:
                setattr(doc, key, value)

        # If content is updated, regenerate embedding
        if "content" in updates and updates["content"]:
            logger.info("Regenerating embedding for updated content...")
            doc.embedding = _get_embedding(updates["content"])

        doc.updated_at = datetime.now()
        db.commit()

        logger.info(f"Document {doc_id} updated successfully")

        return {"status": "success", "message": "Document updated"}

    except Exception as e:
        logger.error(f"Error updating document: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Failed to update document: {str(e)}"}
    finally:
        if db:
            db.close()


def list_documents(
    limit: int = 100,
    offset: int = 0,
    access_level: int | None = None,
    company_id: int | None = None,
    department: str | None = None,
) -> list[dict]:
    """
    List documents with optional filtering.

    Args:
        limit: Maximum number of results
        offset: Offset for pagination
        access_level: Optional access level filter
        company_id: Optional company ID filter
        department: Optional department filter

    Returns:
        List of document metadata (without content for efficiency)
    """
    db = None
    try:
        db = get_db_session()
        query = db.query(KnowledgeBaseDocument)

        if access_level is not None:
            query = query.filter(KnowledgeBaseDocument.access_level <= access_level)
        if company_id is not None:
            query = query.filter(KnowledgeBaseDocument.company_id == company_id)
        if department is not None:
            query = query.filter(KnowledgeBaseDocument.department == department)

        docs = (
            query.order_by(KnowledgeBaseDocument.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        return [
            {
                "id": str(doc.id),
                "title": doc.title,
                "sourcefile": doc.sourcefile,
                "access_level": doc.access_level,
                "company_id": doc.company_id,
                "department": doc.department,
                "doc_type": doc.doc_type,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
            }
            for doc in docs
        ]

    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        return []
    finally:
        if db:
            db.close()


def get_document_count(
    access_level: int | None = None,
    company_id: int | None = None,
) -> int:
    """
    Get total count of documents.

    Args:
        access_level: Optional access level filter
        company_id: Optional company ID filter

    Returns:
        Count of documents
    """
    db = None
    try:
        db = get_db_session()
        query = db.query(KnowledgeBaseDocument)

        if access_level is not None:
            query = query.filter(KnowledgeBaseDocument.access_level <= access_level)
        if company_id is not None:
            query = query.filter(KnowledgeBaseDocument.company_id == company_id)

        return query.count()

    except Exception as e:
        logger.error(f"Error counting documents: {e}")
        return 0
    finally:
        if db:
            db.close()


def reindex_document(doc_id: str) -> dict:
    """
    Regenerate embedding for a document.

    Args:
        doc_id: Document ID

    Returns:
        Dictionary with status
    """
    db = None
    try:
        logger.info(f"Reindexing document: {doc_id}")

        db = get_db_session()
        doc = db.query(KnowledgeBaseDocument).filter(KnowledgeBaseDocument.id == doc_id).first()

        if not doc:
            return {"status": "error", "message": "Document not found"}

        # Regenerate embedding
        doc.embedding = _get_embedding(doc.content)
        doc.updated_at = datetime.now()
        db.commit()

        logger.info(f"Document {doc_id} reindexed successfully")

        return {"status": "success", "message": "Document reindexed"}

    except Exception as e:
        logger.error(f"Error reindexing document: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Failed to reindex document: {str(e)}"}
    finally:
        if db:
            db.close()


def reindex_all_documents() -> dict:
    """
    Regenerate embeddings for all documents.

    Returns:
        Dictionary with status and count
    """
    db = None
    try:
        logger.info("Reindexing all documents...")

        db = get_db_session()
        docs = db.query(KnowledgeBaseDocument).all()

        count = 0
        for doc in docs:
            try:
                doc.embedding = _get_embedding(doc.content)
                doc.updated_at = datetime.now()
                count += 1
                if count % 10 == 0:
                    logger.info(f"Reindexed {count} documents...")
                    db.commit()
            except Exception as e:
                logger.error(f"Error reindexing document {doc.id}: {e}")
                continue

        db.commit()
        logger.info(f"Reindexed {count} documents")

        return {"status": "success", "message": f"Reindexed {count} documents"}

    except Exception as e:
        logger.error(f"Error in bulk reindex: {e}")
        if db:
            db.rollback()
        return {"status": "error", "message": f"Bulk reindex failed: {str(e)}"}
    finally:
        if db:
            db.close()


# ============================================================================
# Backward Compatibility Aliases
# ============================================================================

# Deprecated aliases for backward compatibility
store_in_azure_kb = store_in_kb
store_in_qdrant = store_in_kb
search_qdrant = search_kb
