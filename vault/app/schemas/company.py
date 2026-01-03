from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class CompanyBase(BaseModel):
    name: str
    company_reg_no: str
    contact_email: EmailStr | None = None
    contact_first_name: str | None = None
    contact_last_name: str | None = None
    contact_telephone: str | None = None

class CompanyCreate(CompanyBase):
    registered_since: date

class CompanyUpdate(BaseModel):
    name: str | None = None
    contact_email: EmailStr | None = None
    contact_first_name: str | None = None
    contact_last_name: str | None = None
    user_chat_bubble_colour: str | None = None
    bot_chat_bubble_colour: str | None = None
    font: str | None = None
    logo: str | None = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    registered_since: date
    user_chat_bubble_colour: str
    bot_chat_bubble_colour: str

    model_config = {"from_attributes": True}
