from datetime import datetime

from pydantic import UUID4, BaseModel


class RoleBase(BaseModel):
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    pass


class RoleResponse(RoleBase):
    id: UUID4
    created_at: datetime

    model_config = {"from_attributes": True}


class UserRoleCreate(BaseModel):
    user_id: UUID4
    role_id: UUID4
    company_reg_no: str


class UserRoleResponse(BaseModel):
    user_id: UUID4
    role_id: UUID4
    company_reg_no: str
    assigned_at: datetime

    model_config = {"from_attributes": True}
