"""
Knowledge Base models for RAG (Retrieval Augmented Generation)
"""

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, Integer, String, Text, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship

from app.core.config import settings
from app.models.base import Base


class KBDocument(Base):
    """Knowledge base document for RAG."""

    __tablename__ = "kbdocuments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    sourcefile = Column(String(500), nullable=True)
    title = Column(String(500), nullable=True)
    accesslevel = Column(Integer, default=1, index=True)
    
    # Hybrid Search support: Text search vector
    tsv = Column(TSVECTOR)

    # multi-tenancy
    companyid = Column(Integer, nullable=True, index=True)
    department = Column(String(100), nullable=True)

    createdat = Column(DateTime(timezone=True), server_default=func.now())
    updatedat = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to chunks
    chunks = relationship("KBChunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<KBDocument(id={self.id}, title={self.title})>"


class KBChunk(Base):
    """Chunks of Knowledge base documents with vector embedding for RAG."""

    __tablename__ = "kbchunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doc_id = Column(UUID(as_uuid=True), ForeignKey("kbdocuments.id", ondelete="CASCADE"), index=True)
    chunk_index = Column(Integer, nullable=False)
    
    content = Column(Text, nullable=False)
    embedding = Column(Vector(settings.VECTOR_DIMENSIONS), nullable=True)
    
    # Hybrid Search support: Text search vector per chunk
    tsv = Column(TSVECTOR)

    # Metadata (denormalized for fast single-table retrieval)
    title = Column(String(500), nullable=True)
    sourcefile = Column(String(500), nullable=True)
    accesslevel = Column(Integer, default=1, index=True)

    # Relationships
    document = relationship("KBDocument", back_populates="chunks")

    def __repr__(self):
        return f"<KBChunk(doc_id={self.doc_id}, index={self.chunk_index})>"
