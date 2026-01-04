from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    email_confirmed_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserInfo(BaseModel):
    user_id: str
    is_validator: bool
    is_expert: bool


class UserProfileRequest(BaseModel):
    user_id: str


class UserProfileResponse(BaseModel):
    profile: dict


class UpdateUserDetailsRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    telephone: str
    company: str
    user_id: str | None = None
    username: str | None = None
    roles: list[str] | None = None


class OrganisationDetails(BaseModel):
    firstName: str
    lastName: str
    email: str
    telephone: str
    company: str
    registeredSince: str
    user_id: str | None = None


class DeleteUserResponse(BaseModel):
    message: str


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

    firstName: str
    lastName: str
    email: str
    telephone: str
    company: str
    registeredSince: str


class GetCompanyContactDetailsRequest(BaseModel):
    """Request schema for getcompanycontactdetails."""

    user_id: str


class UpdateCompanyContactDetailsRequest(BaseModel):
    """Request schema for updatecompanycontactdetails."""

    user_id: str
    firstName: str
    lastName: str
    email: EmailStr
    telephone: str
