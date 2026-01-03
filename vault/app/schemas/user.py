from datetime import datetime

from pydantic import UUID4, BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID4
    email_confirmed_at: datetime | None = None
    last_sign_in_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
