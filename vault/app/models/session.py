"""
Session and Question models
"""

import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class SessionStatus(str, enum.Enum):
    """Session status enum"""

    NOT_STARTED = "Not Started"
    STARTED = "Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class Session(Base):
    """Session model"""

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), index=True)
    status = Column(
        SQLEnum(SessionStatus, name="session_status_enum", create_type=False),
        default=SessionStatus.NOT_STARTED,
    )
    password_changed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("Profile", back_populates="sessions")
    questions = relationship("Question", back_populates="session", cascade="all, delete-orphan")


class Question(Base):
    """Question model for sessions"""

    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("Profile", back_populates="questions")
    session = relationship("Session", back_populates="questions")
