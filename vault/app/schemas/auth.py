"""
Authentication Schemas
Pydantic models for authentication requests/responses
"""

from pydantic import BaseModel, EmailStr, Field, validator


class UserLogin(BaseModel):
    """User login request"""

    email: EmailStr
    password: str = Field(..., min_length=8)


class UserCreate(BaseModel):
    """User creation request"""

    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str | None = None
    last_name: str | None = None
    full_name: str | None = None
    username: str | None = None
    telephone: str | None = None
    company_id: int | None = None
    company_name: str | None = None
    company_reg_no: str | None = None
    department: str | None = None
    user_access: str | None = "employee"
    email_confirmed: bool = False

    @validator("full_name", always=True)
    def generate_full_name(self, v, values):
        if v:
            return v
        first = values.get("first_name", "")
        last = values.get("last_name", "")
        if first and last:
            return f"{first} {last}"
        return v


class TokenResponse(BaseModel):
    """JWT token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


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


class PasswordReset(BaseModel):
    """Password reset with token"""

    email: EmailStr
    token: str
    password: str = Field(..., min_length=8)
    password_confirmation: str = Field(..., min_length=8)

    @validator("password_confirmation")
    def passwords_match(self, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Passwords do not match")
        return v


class PasswordChange(BaseModel):
    """Change password for logged-in user"""

    old_password: str
    new_password: str = Field(..., min_length=8)
    new_password_confirmation: str = Field(..., min_length=8)

    @validator("new_password_confirmation")
    def passwords_match(self, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v
