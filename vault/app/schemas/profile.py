from datetime import datetime

from pydantic import UUID4, BaseModel, EmailStr


class ProfileBase(BaseModel):
    username: str
    full_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None
    telephone: str | None = None
    field_of_expertise: str | None = None

class ProfileCreate(ProfileBase):
    user_id: UUID4  # Must match auth.users.id
    company_id: int
    company_reg_no: str

class ProfileUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None
    telephone: str | None = None
    field_of_expertise: str | None = None
    years_of_experience: str | None = None
    cv_text: str | None = None

class ProfileResponse(ProfileBase):
    id: UUID4
    company_id: int | None = None
    company_name: str | None = None
    company_reg_no: str | None = None
    status: str
    is_validator: bool
    user_access: str
    created_at: datetime

    model_config = {"from_attributes": True}
