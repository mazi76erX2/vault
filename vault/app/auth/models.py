import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from vault.app.db.base_class import Base

# Define your Auth-related SQLAlchemy models here
# For example, if you have tables for tokens, permissions, etc.


class Role(Base):
    __tablename__ = "roles"

    # Columns based on roles.sql
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to Profile (many-to-many)
    # The string 'Profile' refers to the class name. SQLAlchemy resolves this.
    # 'user_roles' is the name of the association table.
    profiles = relationship("Profile", secondary="user_roles", back_populates="roles")

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="RESTRICT"),
        primary_key=True,
    )
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    # Optional: Define direct relationships from UserRole to Profile and Role if needed for direct querying
    # profile = relationship("Profile", back_populates="user_role_associations")
    # role = relationship("Role", back_populates="user_role_associations")

    def __repr__(self):
        return f"<UserRole(user_id={self.user_id}, role_id={self.role_id})>"


# Note: The Profile model in vault.users.models also needs its 'roles' relationship defined.
# It will look like:
# from vault.app.db.base_class import Base # (already there)
# from sqlalchemy.orm import relationship # (needs to be added or ensured)
# class Profile(Base):
#     # ... other attributes ...
#     roles = relationship(
#         "Role",
#         secondary="user_roles",
#         back_populates="profiles"
#     )
