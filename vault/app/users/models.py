from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from vault.app.db.base_class import Base
from vault.app.db.enums import (
    DepartmentEnum,  # Import necessary enums
    UserAccessLevelsEnum,
)

# Define your User-related SQLAlchemy models here
# For example:
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True)
#     # ... other fields


class Profile(Base):
    __tablename__ = "profiles"

    # Columns based on profiles.sql
    id = Column(
        UUID(as_uuid=True),
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        primary_key=True,
        comment="References auth.users.id from Supabase",
    )
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=func.now())
    username = Column(
        String, nullable=True, unique=True
    )  # DB constraint for length will be handled by SQL
    full_name = Column(Text, nullable=True)
    website = Column(Text, nullable=True)
    department = Column(
        SAEnum(DepartmentEnum, name="department_enum_profiles", create_type=False),
        nullable=True,
    )  # create_type=False if ENUM type is globally defined by enums.sql
    field_of_expertise = Column(Text, nullable=True)
    years_of_experience = Column(
        String, nullable=True
    )  # Kept as String as per SQL, consider Integer if appropriate
    cv_text = Column("CV_text", Text, nullable=True)  # Explicit column name due to SQL quotes
    is_validator = Column("isValidator", Boolean, nullable=False, server_default="false")
    user_access = Column(
        SAEnum(
            UserAccessLevelsEnum,
            name="user_access_levels_enum_profiles",
            create_type=False,
        ),
        nullable=True,
        server_default=UserAccessLevelsEnum.EMPLOYEE.value,
    )
    telephone = Column(String, nullable=True)
    email = Column(
        String, nullable=True
    )  # Supabase auth.users already has email, this might be redundant or for a different purpose

    company_id = Column(BigInteger, ForeignKey("companies.id"), nullable=True)
    company_name = Column(
        String, nullable=True
    )  # This might be redundant if we have a relationship to companies table

    user_type_id = Column(
        "user_type", BigInteger, ForeignKey("user_types.id"), nullable=True
    )  # Using original column name "user_type"

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Relationship to Role (many-to-many)
    roles = relationship("Role", secondary="user_roles", back_populates="profiles")

    # --- Relationships --- (Will be defined more fully when Company and UserType models are created)
    # company = relationship("Company", back_populates="profiles")
    # user_type_obj = relationship("UserType", back_populates="profiles") # Renamed to avoid conflict if UserType model is named UserType
    # roles = relationship("Role", secondary="user_roles", back_populates="users") # If using UserRole association

    def __repr__(self):
        return f"<Profile(id={self.id}, username='{self.username}')>"
