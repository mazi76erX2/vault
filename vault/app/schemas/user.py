"""
User-specific schemas (profile, company details, etc.)
Note: UserCreate and UserResponse are in auth.py
"""

from pydantic import BaseModel, EmailStr


class UserInfo(BaseModel):
    """User info for internal use"""

    user_id: str
    is_validator: bool
    is_expert: bool


class UserProfileRequest(BaseModel):
    """Request for user profile"""

    user_id: str


class UserProfileResponse(BaseModel):
    """User profile response"""

    profile: dict


class UpdateUserDetailsRequest(BaseModel):
    """Update user details request"""

    first_name: str
    last_name: str
    email: EmailStr
    telephone: str
    company: str
    user_id: str | None = None
    username: str | None = None
    roles: list[str] | None = None


class OrganisationDetails(BaseModel):
    """Organisation details"""

    first_name: str
    last_name: str
    email: str
    telephone: str
    company: str
    registered_since: str
    user_id: str | None = None


class UserCompanyRequest(BaseModel):
    """Request for user company"""

    user_id: str


class CompanyDetails(BaseModel):
    """Company details response"""

    company_name: str
    company_reg_no: str


class GetUserCompanyResponse(BaseModel):
    """Get user company response"""

    company: CompanyDetails


class DeleteUserResponse(BaseModel):
    """Delete user response"""

    message: str
