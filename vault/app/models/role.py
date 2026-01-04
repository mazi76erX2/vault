"""
Role and UserRole Models
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Role(Base):
    """Role model"""

    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user_roles = relationship("UserRole", back_populates="role")


class UserRole(Base):
    """User-Role association model"""

    __tablename__ = "user_roles"

    user_id = Column(
        UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True
    )
    role_id = Column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="RESTRICT"), primary_key=True
    )
    company_reg_no = Column(Text, primary_key=True, index=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships - FIX THESE
    profile = relationship(
        "Profile", back_populates="user_roles"
    )  # Changed from back_populates="profile"
    role = relationship("Role", back_populates="user_roles")
