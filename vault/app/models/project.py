"""
Project model
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID

from .base import Base


class Project(Base):
    """Project model for organizing knowledge collection."""

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    manager_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("profiles.id", ondelete="SET NULL"), 
        nullable=True
    )
    company_id = Column(String(255), nullable=True)
    company_reg_no = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="active", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Project {self.name}>"