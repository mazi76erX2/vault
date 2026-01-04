import enum

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Text,
    func,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class UserAccessLevel(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    GUEST = "guest"


class Department(str, enum.Enum):
    AI_CC = "AI CC"
    PLANNING = "Planning"
    ANALYTICS = "Analytics"
    HR = "HR"
    DATA_CLOUD = "Data Cloud"
    SALES = "Sales"
    MARKETING = "Marketing"


class Profile(Base):
    __tablename__ = "profiles"

    # Primary key that references auth.users
    id = Column(
        UUID(as_uuid=True), ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True
    )

    # User information
    username = Column(Text, unique=True)
    full_name = Column(Text)
    email = Column(Text, index=True)
    telephone = Column(Text)
    website = Column(Text)

    # Professional details
    department = Column(SQLEnum(Department, name="department", create_type=False))
    field_of_expertise = Column(Text)
    years_of_experience = Column(Text)
    cv_text = Column(Text)

    # Access control
    is_validator = Column(Boolean, default=False)
    user_access = Column(
        SQLEnum(UserAccessLevel, name="user_access_levels", create_type=False),
        default=UserAccessLevel.EMPLOYEE,
    )
    status = Column(Text, default="active")

    # Multi-tenancy
    company_id = Column(BigInteger, ForeignKey("companies.id"), index=True)
    company_reg_no = Column(Text, index=True)
    company_name = Column(Text)
    # user_type = Column(BigInteger, ForeignKey("user_types.id"))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
    company = relationship("Company", back_populates="profiles")
    documents_reviewed = relationship("Document", back_populates="reviewer_profile")
    user_roles = relationship("UserRole", back_populates="user_profile")
    chat_messages = relationship("ChatMessage", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    questions = relationship("Question", back_populates="user")

    # Constraints
    __table_args__ = (CheckConstraint("char_length(username) >= 3", name="username_length"),)
