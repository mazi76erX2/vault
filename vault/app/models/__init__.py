"""
Models package
Exports all SQLAlchemy models for Alembic auto-detection
"""

from app.models.base import Base
from app.models.chat import ChatMessage, ChatMessageCollector
from app.models.company import Company
from app.models.document import Document, DocumentAssignment
from app.models.kb import KBDocument
from app.models.profile import Profile
from app.models.project import Project
from app.models.refresh_token import RefreshToken
from app.models.role import Role, UserRole
from app.models.session import Question, Session, SessionStatus
from app.models.user import User
from app.models.user_type import UserType


__all__ = [
    "Base",
    "User",
    "Profile",
    "Company",
    "Document",
    "DocumentAssignment",
    "Session",
    "SessionStatus",
    "Question",
    "Role",
    "UserRole",
    "RefreshToken",
    "ChatMessage",
    "ChatMessageCollector",
    "UserType",
    "Project",
    "KBDocument",
]
