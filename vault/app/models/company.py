from sqlalchemy import UUID, BigInteger, Column, Date, DateTime, Text, func
from sqlalchemy.orm import relationship

from .base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    company_reg_no = Column(Text, unique=True, nullable=False, index=True)
    contact_email = Column(Text, index=True)
    contact_first_name = Column(Text)
    contact_last_name = Column(Text)
    contact_telephone = Column(Text)
    contact_user_id = Column(UUID(as_uuid=True))
    registered_since = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Branding/Theme settings
    user_chat_bubble_colour = Column(Text, default="#007bff")
    bot_chat_bubble_colour = Column(Text, default="#e5e5ea")
    send_button_and_box = Column(Text, default="#ffffff")
    user_chat_font_colour = Column(Text, default="#000000")
    bot_chat_font_colour = Column(Text, default="#000000")
    font = Column(Text, default="Tahoma")
    logo = Column(Text)
    bot_profile_picture = Column(Text)

    # Relationships
    profiles = relationship("Profile", back_populates="company")
    # ldap_connectors = relationship("LDAPConnector", back_populates="company")
