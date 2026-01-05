from datetime import datetime

from pydantic import UUID4, BaseModel


class LDAPConnectorBase(BaseModel):
    name: str
    server_url: str
    bind_dn: str
    search_base: str
    search_filter: str | None = "(objectClass=person)"


class LDAPConnectorCreate(LDAPConnectorBase):
    vault_secret_name: str  # Reference to vault secret, not the password
    company_id: int
    ssl_enabled: bool | None = False
    port: int | None = 389
    timeout: int | None = 30
    page_size: int | None = 1000
    user_attributes: dict | None = None


class LDAPConnectorUpdate(BaseModel):
    name: str | None = None
    server_url: str | None = None
    bind_dn: str | None = None
    search_base: str | None = None
    vault_secret_name: str | None = None
    ssl_enabled: bool | None = None
    port: int | None = None
    status: str | None = None


class LDAPConnectorResponse(LDAPConnectorBase):
    id: UUID4
    company_id: int
    ssl_enabled: bool
    port: int
    status: str
    last_sync: datetime | None = None
    sync_count: int
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
