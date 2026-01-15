"""
Knowledge Base models for RAG (Retrieval Augmented Generation)
"""

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.config import settings
from app.models.base import Base  # Use the MAIN Base!


class KBDocument(Base):
    """Knowledge base document with vector embedding for RAG."""

    __tablename__ = "kbdocuments"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Content
    content = Column(Text, nullable=False)
    embedding = Column(Vector(settings.VECTOR_DIMENSIONS), nullable=True)

    # Metadata
    sourcefile = Column(String(500), nullable=True)
    title = Column(String(500), nullable=True)
    accesslevel = Column(Integer, default=1, index=True)

    # Multi-tenancy
    companyid = Column(Integer, nullable=True, index=True)
    companyregno = Column(String(50), nullable=True, index=True)
    department = Column(String(100), nullable=True)

    # Additional metadata
    tags = Column(Text, nullable=True)  # Comma-separated tags
    author = Column(String(255), nullable=True)
    doctype = Column(String(50), nullable=True)

    # Timestamps
    createdat = Column(DateTime(timezone=True), server_default=func.now())
    updatedat = Column(DateTime(timezone=True), onupdate=func.now())
    lastmodifieddate = Column(DateTime(timezone=True))

    def __repr__(self):
        return f"<KBDocument(id={self.id}, title={self.title})>"
