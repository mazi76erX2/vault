"""
Schema exports for the application.
Centralized import point for all Pydantic schemas.
"""

# Auth schemas
from .auth import (CheckFirstLoginModel, EmailTestRequest, PasswordChange,
                   PasswordReset, PasswordResetRequest, PasswordResetResponse,
                   TokenResponse, UserCreate, UserLogin, UserResponse)
# Company schemas
from .company import (CompanyContactDetails, CompanyCreate, CompanyResponse,
                      CompanyThemeSettingsPayload,
                      CompanyThemeSettingsResponse, CompanyUpdate,
                      GetCompanyContactDetailsRequest,
                      GetCompanyThemeSettingsRequest,
                      GetCompanyThemeSettingsResponse,
                      UpdateCompanyContactDetailsRequest,
                      UpdateCompanyThemeSettingsRequest)
# Document schemas
from .document import (DocumentCreate, DocumentResponse, DocumentUpdate,
                       DocumentWithSimilarity)
# LDAP schemas
from .ldap import (LDAPConnectorCreate, LDAPConnectorResponse,
                   LDAPConnectorUpdate)
# Profile schemas
from .profile import ProfileCreate, ProfileResponse, ProfileUpdate
from .project import ProjectBase, ProjectCreate, ProjectResponse, ProjectUpdate
# Role schemas
from .role import RoleCreate, RoleResponse, UserRoleCreate, UserRoleResponse
# Session schemas
from .session import (QuestionCreate, QuestionResponse, SessionCreate,
                      SessionResponse, SessionUpdate)
# User-specific schemas (NOT UserCreate/UserResponse - those are in auth)
from .user import (CompanyDetails, DeleteUserResponse, GetUserCompanyResponse,
                   OrganisationDetails, UpdateUserDetailsRequest,
                   UserCompanyRequest, UserInfo, UserProfileRequest,
                   UserProfileResponse)

__all__ = [
    # Auth schemas
    "CheckFirstLoginModel",
    "EmailTestRequest",
    "PasswordChange",
    "PasswordReset",
    "PasswordResetRequest",
    "PasswordResetResponse",
    "TokenResponse",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    # Company schemas
    "CompanyContactDetails",
    "CompanyCreate",
    "CompanyResponse",
    "CompanyThemeSettingsPayload",
    "CompanyThemeSettingsResponse",
    "CompanyUpdate",
    "GetCompanyContactDetailsRequest",
    "GetCompanyThemeSettingsRequest",
    "GetCompanyThemeSettingsResponse",
    "UpdateCompanyContactDetailsRequest",
    "UpdateCompanyThemeSettingsRequest",
    # Document schemas
    "DocumentCreate",
    "DocumentResponse",
    "DocumentUpdate",
    "DocumentWithSimilarity",
    # LDAP schemas
    "LDAPConnectorCreate",
    "LDAPConnectorResponse",
    "LDAPConnectorUpdate",
    # Profile schemas
    "ProfileCreate",
    "ProfileResponse",
    "ProfileUpdate",
    # Role schemas
    "RoleCreate",
    "RoleResponse",
    "UserRoleCreate",
    "UserRoleResponse",
    # Session schemas
    "QuestionCreate",
    "QuestionResponse",
    "SessionCreate",
    "SessionResponse",
    "SessionUpdate",
    # User-specific schemas
    "CompanyDetails",
    "DeleteUserResponse",
    "GetUserCompanyResponse",
    "OrganisationDetails",
    "UpdateUserDetailsRequest",
    "UserCompanyRequest",
    "UserInfo",
    "UserProfileRequest",
    "UserProfileResponse",
    # Project schemas
    "ProjectBase",
    "ProjectCreate",
    "ProjectResponse",
    "ProjectUpdate",
]
