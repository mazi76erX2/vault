"""
User Model - Maps to Supabase auth.users
"""

import uuid
from datetime import datetime

from sqlalchemy import TIMESTAMP, Boolean, Column, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from .base import Base


class User(Base):
    """
    Maps to auth.users schema in Supabase
    This is the authentication table managed by auth system
    """

    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False, index=True)
    encrypted_password = Column(Text)  # Supabase uses this field name
    email_confirmed_at = Column(TIMESTAMP(timezone=True))
    invited_at = Column(TIMESTAMP(timezone=True))
    confirmation_token = Column(Text)
    confirmation_sent_at = Column(TIMESTAMP(timezone=True))
    recovery_token = Column(Text)
    recovery_sent_at = Column(TIMESTAMP(timezone=True))
    email_change_token_new = Column(Text)
    email_change = Column(Text)
    email_change_sent_at = Column(TIMESTAMP(timezone=True))
    last_sign_in_at = Column(TIMESTAMP(timezone=True))
    raw_app_meta_data = Column(JSONB)
    raw_user_meta_data = Column(JSONB)
    is_super_admin = Column(Boolean)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    phone = Column(Text)
    phone_confirmed_at = Column(TIMESTAMP(timezone=True))
    phone_change = Column(Text)
    phone_change_token = Column(Text)
    phone_change_sent_at = Column(TIMESTAMP(timezone=True))
    confirmed_at = Column(TIMESTAMP(timezone=True))
    email_change_token_current = Column(Text)
    email_change_confirm_status = Column(Integer)
    banned_until = Column(TIMESTAMP(timezone=True))
    reauthentication_token = Column(Text)
    reauthentication_sent_at = Column(TIMESTAMP(timezone=True))
    is_sso_user = Column(Boolean, default=False)
    deleted_at = Column(TIMESTAMP(timezone=True))

    # Helper properties
    @property
    def is_active(self):
        """User is active if not deleted and not banned"""
        return self.deleted_at is None and (
            self.banned_until is None or self.banned_until < datetime.utcnow()
        )

    @property
    def email_confirmed(self):
        """Check if email is confirmed"""
        return self.email_confirmed_at is not None or self.confirmed_at is not None

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
