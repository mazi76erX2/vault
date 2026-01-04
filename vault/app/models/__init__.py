"""
Models package
Exports all SQLAlchemy models for Alembic auto-detection
"""

from app.models.base import Base
from app.models.chat import ChatMessage, ChatMessageCollector
from app.models.company import Company
from app.models.document import Document, DocumentAssignment
from app.models.profile import Profile
from app.models.role import Role, UserRole
from app.models.session import Question, Session
from app.models.user import User

__all__ = [
    "Base",
    "User",
    "Profile",
    "Company",
    "Document",
    "DocumentAssignment",
    "Session",
    "Question",
    "Role",
    "UserRole",
    "ChatMessage",
    "ChatMessageCollector",
]
