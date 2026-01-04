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


class GetCompanyThemeSettingsRequest(BaseModel):
    """Request schema for get_company_theme_settings."""

    user_id: str


class CompanyThemeSettingsResponse(BaseModel):
    """Response schema for get_company_theme_settings."""

    id: str
    name: str
    user_chat_bubble_colour: str | None = None
    bot_chat_bubble_colour: str | None = None
    send_button_and_box: str | None = None
    font: str | None = None
    user_chat_font_colour: str | None = None
    bot_chat_font_colour: str | None = None
    logo: str | None = None
    bot_profile_picture: str | None = None


class GetCompanyThemeSettingsResponse(BaseModel):
    """Response schema for get_company_theme_settings."""

    status: str
    theme_settings: CompanyThemeSettingsResponse


class CompanyThemeSettingsPayload(BaseModel):
    """Request schema for updatecompanythemesettings."""

    user_chat_bubble_colour: str | None = None
    bot_chat_bubble_colour: str | None = None
    send_button_and_box: str | None = None
    font: str | None = None
    user_chat_font_colour: str | None = None
    bot_chat_font_colour: str | None = None
    logo: str | None = None
    bot_profile_picture: str | None = None


class UpdateCompanyThemeSettingsRequest(BaseModel):
    """Request to update company theme settings."""

    user_id: str
    theme_settings: CompanyThemeSettingsPayload


class CompanyContactDetails(BaseModel):
    """Company contact details model."""

    first_name: str
    last_name: str
    email: str
    telephone: str
    company: str
    registered_since: str


class GetCompanyContactDetailsRequest(BaseModel):
    """Request schema for getcompanycontactdetails."""

    user_id: str


class UpdateCompanyContactDetailsRequest(BaseModel):
    """Request schema for updatecompanycontactdetails."""

    user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    telephone: str
