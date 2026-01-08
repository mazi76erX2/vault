from datetime import datetime
from sqlalchemy import Column, DateTime, String, Text, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base


class Project(Base):
    """Project model for organizing knowledge collection sessions."""
    
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(BigInteger, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    company_regno = Column(String, nullable=True)
    status = Column(String, default="active")  # active, archived, completed
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    manager = relationship("Profile", foreign_keys=[manager_id], backref="managed_projects")
    
    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"
