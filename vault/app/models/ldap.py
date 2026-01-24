import enum
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.config import settings
from .base import Base


class SecurityLevel(str, enum.Enum):
    PUBLIC = "Public"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class StatusEnum(str, enum.Enum):
    DRAFT = "Draft"
    PENDING = "Pending"
    ON_REVIEW = "On Review"
    REJECTED = "Rejected"
    VALIDATED_STORED = "Validated - Stored"
    VALIDATED_AWAITING = "Validated - Awaiting Approval"


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "inprogress"
    COMPLETED = "completed"


class Document(Base):
    __tablename__ = "documents"

    doc_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text)
    content = Column(Text)
    summary = Column(Text)
    link = Column(Text)

    # Classification
    severity_levels = Column(SQLEnum(SecurityLevel, name="security_level", create_type=False))
    status = Column(SQLEnum(StatusEnum, name="status_enum", create_type=False))

    # Vector embedding for semantic search
    embedding = Column(Vector(settings.VECTOR_DIMENSIONS))

    # Review
    reviewer = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    reviewer_profile = relationship("Profile", back_populates="documents_reviewed")
    assignments = relationship("DocumentAssignment", back_populates="document")


class DocumentAssignment(Base):
    __tablename__ = "document_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.doc_id", ondelete="CASCADE"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(
        SQLEnum(DocumentStatus, name="document_status", create_type=False),
        default=DocumentStatus.PENDING,
    )

    # Relationships
    document = relationship("Document", back_populates="assignments")
