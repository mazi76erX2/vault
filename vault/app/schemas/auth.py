"""
Authentication Schemas
Pydantic models for authentication requests/responses
"""

from pydantic import (BaseModel, EmailStr, Field, ValidationInfo,
                      field_validator)


class UserLogin(BaseModel):
    """User login request"""

    email: EmailStr
    password: str = Field(..., min_length=8)


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    telephone: str | None = None
    company_id: int | None = None
    company_name: str | None = None
    company_reg_no: str | None = None
    department: str | None = None
    user_access: str | int | None = None
    email_confirmed: bool = False

    @field_validator("full_name", mode="before")
    @classmethod
    def generate_full_name(cls, v, info: ValidationInfo):
        if v:
            return v
        first = info.data.get("first_name", "")
        last = info.data.get("last_name", "")
        if first and last:
            return f"{first} {last}"
        return v


class TokenResponse(BaseModel):
    """JWT token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class CurrentUser(BaseModel):
    user: dict
    profile: dict
    roles: list[str] = []
    company_reg_no: str | None = None

class LoginResponse(TokenResponse):
    user: CurrentUser

class UserResponse(BaseModel):
    """User response with profile"""

    id: str
    email: str
    full_name: str | None
    username: str | None
    company_reg_no: str | None
    roles: list[str] = []


class PasswordResetRequest(BaseModel):
    """Password reset request"""

    email: EmailStr


class PasswordResetResponse(BaseModel):
    """Response schema for password reset endpoint."""

    status: str
    message: str


class PasswordReset(BaseModel):
    """Password reset with token"""

    email: EmailStr
    token: str
    password: str = Field(..., min_length=8)
    password_confirmation: str = Field(..., min_length=8)

    @field_validator("password_confirmation")
    @classmethod
    def passwords_match(cls, v, info: ValidationInfo):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class PasswordChange(BaseModel):
    """Change password for logged-in user"""

    old_password: str
    new_password: str = Field(..., min_length=8)
    new_password_confirmation: str = Field(..., min_length=8)

    @field_validator("new_password_confirmation")
    @classmethod
    def passwords_match(cls, v, info: ValidationInfo):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class CheckFirstLoginModel(BaseModel):
    """Request schema for check-first-login endpoint."""

    user_id: str


class EmailTestRequest(BaseModel):
    """Request schema for test-email endpoint."""

    recipient_email: str
    subject: str | None = "Test Email from Vault"
    content: str | None = "This is a test email from the Vault application."
    username: str | None = None
