import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..config import settings
from .base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages_helper"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), index=True)
    message = Column(Text, nullable=False)

    # Vector embedding for semantic chat history search
    embedding = Column(Vector(settings.VECTOR_DIMENSIONS))

    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("Profile", back_populates="chat_messages")


class ChatMessageCollector(Base):
    __tablename__ = "chat_messages_collector"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), index=True)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
