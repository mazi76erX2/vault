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

    # IMPORTANT: map python attr -> real DB column name
    encryptedpassword = Column("encrypted_password", Text)  # Supabase uses this field name

    emailconfirmedat = Column("email_confirmed_at", TIMESTAMP(timezone=True))
    invitedat = Column("invited_at", TIMESTAMP(timezone=True))

    confirmationtoken = Column("confirmation_token", Text)
    confirmationsentat = Column("confirmation_sent_at", TIMESTAMP(timezone=True))

    recoverytoken = Column("recovery_token", Text)
    recoverysentat = Column("recovery_sent_at", TIMESTAMP(timezone=True))

    emailchangetokennew = Column("email_change_token_new", Text)
    emailchange = Column("email_change", Text)
    emailchangesentat = Column("email_change_sent_at", TIMESTAMP(timezone=True))

    lastsigninat = Column("last_sign_in_at", TIMESTAMP(timezone=True))

    rawappmetadata = Column("raw_app_meta_data", JSONB)
    rawusermetadata = Column("raw_user_meta_data", JSONB)

    issuperadmin = Column("is_super_admin", Boolean)

    createdat = Column("created_at", TIMESTAMP(timezone=True), default=datetime.utcnow)
    updatedat = Column(
        "updated_at",
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    phone = Column(Text)
    phoneconfirmedat = Column("phone_confirmed_at", TIMESTAMP(timezone=True))
    phonechange = Column("phone_change", Text)
    phonechangetoken = Column("phone_change_token", Text)
    phonechangesentat = Column("phone_change_sent_at", TIMESTAMP(timezone=True))

    confirmedat = Column("confirmed_at", TIMESTAMP(timezone=True))

    emailchangetokencurrent = Column("email_change_token_current", Text)
    emailchangeconfirmstatus = Column("email_change_confirm_status", Integer)

    banneduntil = Column("banned_until", TIMESTAMP(timezone=True))

    reauthenticationtoken = Column("reauthentication_token", Text)
    reauthenticationsentat = Column("reauthentication_sent_at", TIMESTAMP(timezone=True))

    isssouser = Column("is_sso_user", Boolean, default=False)
    deletedat = Column("deleted_at", TIMESTAMP(timezone=True))

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)

    # Match RefreshToken.user back_populates="refresh_tokens" in your repo snapshot
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    @property
    def isactive(self) -> bool:
        return self.deletedat is None and (
            self.banneduntil is None or self.banneduntil < datetime.utcnow()
        )

    @property
    def emailconfirmed(self) -> bool:
        return self.emailconfirmedat is not None or self.confirmedat is not None

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
