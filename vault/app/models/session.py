"""
Session and Question models
"""

import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from .base import Base


class SessionStatus(str, enum.Enum):
    """Session status enum"""

    NOT_STARTED = "Not Started"
    STARTED = "Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class Session(Base):
    """Session model for tracking user chat sessions."""

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), index=True)
    doc_id = Column(
        UUID(as_uuid=True), ForeignKey("documents.doc_id", ondelete="SET NULL"), nullable=True
    )
    chat_messages_id = Column(UUID(as_uuid=True), nullable=True)
    topic = Column(String(255), nullable=True)
    status = Column(
        SQLEnum(SessionStatus, name="session_status_enum", create_type=False),
        default=SessionStatus.NOT_STARTED,
    )
    password_changed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships - use string references to avoid circular imports
    user = relationship("Profile", back_populates="sessions")
    chat_messages_collector = relationship(
        "ChatMessageCollector",
        back_populates="session",
        uselist=False,  # one-to-one: each session has at most one collector
    )


class Question(Base):
    """
    Stores generated questions for collector interviews.
    Uses array columns to store multiple questions per user.
    """

    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    session_id = Column(
        UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True
    )
    # Array columns for storing multiple questions
    questions = Column(ARRAY(Text), nullable=False, default=list)
    status = Column(ARRAY(Text), nullable=False, default=list)
    topics = Column(ARRAY(Text), nullable=True, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships - match what Profile model expects
    user = relationship("Profile", back_populates="questions")

    def __repr__(self):
        count = len(self.questions) if self.questions else 0
        return f"<Question user_id={self.user_id} count={count}>"

    def update_question_status(self, index: int, new_status: str) -> bool:
        """
        Update status of a specific question by index.
        Creates a new list to trigger SQLAlchemy change detection.
        """
        if self.status and 0 <= index < len(self.status):
            new_status_list = list(self.status)
            new_status_list[index] = new_status
            self.status = new_status_list
            return True
        return False

    def get_question_by_index(self, index: int) -> dict | None:
        """Get question details by index."""
        if self.questions and 0 <= index < len(self.questions):
            return {
                "question": self.questions[index],
                "status": (
                    self.status[index]
                    if self.status and index < len(self.status)
                    else "Not Started"
                ),
                "topic": (
                    self.topics[index] if self.topics and index < len(self.topics) else "General"
                ),
            }
        return None
