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


class UserCompanyRequest(BaseModel):
    """Request for user company"""

    user_id: str


class CompanyDetails(BaseModel):
    """Company details response"""

    id: str
    name: str
    registered_since: str


class GetUserCompanyResponse(BaseModel):
    """Get user company response"""

    company: CompanyDetails


class DeleteUserResponse(BaseModel):
    """Delete user response"""

    message: str


class UserItem(BaseModel):
    """User item in list"""

    id: str
    username: str
    firstName: str
    lastName: str
    email: str
    roles: list[str]
    isActive: bool


class UserListResponse(BaseModel):
    """List of users"""

    users: list[UserItem]


class CreateUserRequest(BaseModel):
    """Create user request"""

    username: str
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    roles: list[str]
    companyId: int


class UpdateUserRequest(BaseModel):
    """Update user request"""

    username: str | None = None
    firstName: str | None = None
    lastName: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    roles: list[str] | None = None


class OrganisationDetails(BaseModel):
    """Organisation details"""

    firstName: str
    lastName: str
    email: str
    telephone: str
    company: str
    registeredSince: str
    user_id: str | None = None


class UpdateUserDetailsRequest(BaseModel):
    """Update user details request"""

    firstName: str
    lastName: str
    email: EmailStr
    telephone: str
    company: str
    user_id: str | None = None
    username: str | None = None
    roles: list[str] | None = None
