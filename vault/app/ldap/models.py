import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class LDAPConnectorStatus(str, Enum):
    INACTIVE = "inactive"
    ACTIVE = "active"
    SYNCING = "syncing"
    FAILED = "failed"
    COMPLETE = "complete"


class LDAPConnector(BaseModel):
    """Model for an LDAP connector configuration"""

    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company_id: str
    domain: str
    host: str
    port: str
    username: str
    vault_secret_name: str | None = None
    status: LDAPConnectorStatus = LDAPConnectorStatus.INACTIVE
    base_dn: str
    user_dn: str
    group_dn: str
    directory_type: str = "active_directory"
    is_ssl: bool = False
    sync_interval: int = 60
    search_timeout: int = 30

    # User object settings
    user_object: str = "user"
    user_object_filter: str | None = None
    attribute_username: str = "sAMAccountName"
    attribute_username_rdn: str = "cn"
    attribute_first_name: str = "givenName"
    attribute_last_name: str = "sn"
    attribute_display_name: str = "displayName"
    attribute_principal_name: str = "userPrincipalName"
    attribute_email: str = "mail"
    attribute_user_guid: str = "objectGUID"
    attribute_user_groups: str = "memberOf"

    # Group object settings
    group_object: str = "group"
    group_object_filter: str | None = None
    group_recursive: bool = True
    attribute_group_guid: str = "objectGUID"
    attribute_group_name: str = "cn"
    attribute_group_description: str = "description"
    attribute_group_members: str = "member"

    # Status fields
    status_message: str | None = None
    error: str | None = None
    last_sync: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class LDAPUser(BaseModel):
    """Model for a user returned from LDAP search"""

    type: str = "user"
    name: str
    directory_id: str
    username: str
    email: str
    first_name: str | None = None
    last_name: str | None = None


class LDAPGroup(BaseModel):
    """Model for a group returned from LDAP search"""

    type: str = "group"
    name: str
    directory_id: str
    username: str
    email: str = ""
    members: list[dict] = []


class LDAPSearchResult(BaseModel):
    """Base model for LDAP search responses"""

    type: str
    name: str
    directory_id: str
    username: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    telephone: str | None = None
    department: str | None = None
    members: list[dict] | None = None


class LDAPSearchInputModel(BaseModel):
    """Model for LDAP search input"""

    query: str
    connector_id: str


class LoginModel(BaseModel):
    """Model for login credentials"""

    email: str
    password: str


class LDAPTestConnectionResult(BaseModel):
    """Result of testing an LDAP connection"""

    success: bool
    message: str
    error: str | None = None
    details: dict[str, Any] | None = None
