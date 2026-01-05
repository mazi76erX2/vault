"""
Profile Model
"""

import enum

from sqlalchemy import (BigInteger, Boolean, Column, DateTime, ForeignKey,
                        Text, func)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class UserAccessLevel(str, enum.Enum):
    """User access levels"""

    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    GUEST = "guest"


class Department(str, enum.Enum):
    """Departments"""

    AICC = "AI CC"
    PLANNING = "Planning"
    ANALYTICS = "Analytics"
    HR = "HR"
    DATACLOUD = "Data Cloud"
    SALES = "Sales"
    MARKETING = "Marketing"


class Profile(Base):
    """User profile model"""

    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=True)
    email = Column(Text, nullable=False, index=True)
    full_name = Column(Text, nullable=True)
    username = Column(Text, unique=True, nullable=True, index=True)
    telephone = Column(Text, nullable=True)
    company_id = Column(BigInteger, ForeignKey("companies.id"), nullable=True)
    company_name = Column(Text, nullable=True)
    company_reg_no = Column(Text, nullable=True, index=True)
    department = Column(Text, nullable=True)
    field_of_expertise = Column(Text, nullable=True)
    years_of_experience = Column(BigInteger, nullable=True)
    user_access = Column(BigInteger, default=1)
    status = Column(Text, default="active")
    is_validator = Column(Boolean, default=False)
    CV_text = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
    company = relationship("Company", back_populates="profiles")
    user_roles = relationship("UserRole", back_populates="profile", cascade="all, delete-orphan")
    chatmessages = relationship("ChatMessage", back_populates="user")  # ADD THIS LINE
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="user", cascade="all, delete-orphan")
    documents_reviewed = relationship("Document", back_populates="reviewer_profile")
