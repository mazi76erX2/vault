"""
LDAP API Routes
Handles LDAP connector configuration, authentication, and directory sync
Converted from Supabase to SQLAlchemy
"""

import logging
import random
import string
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from app.config import settings
from app.email_service import send_welcome_email

from .models import LDAPSearchInputModel, LDAPSearchResult, LoginModel
from .service import ldap_authenticate, ldap_search, sync_ldap_connector, test_ldap_connection

logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
async_engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


# ============================================================================
# SQLAlchemy Models
# ============================================================================


class Company(Base):
    """Company model"""

    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    reg_no = Column(String(50), unique=True, nullable=True, index=True)
    address = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profiles = relationship("Profile", back_populates="company")
    ldap_connectors = relationship("LDAPConnectorModel", back_populates="company")


class Profile(Base):
    """User profile model"""

    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    telephone = Column(String(50), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company_name = Column(String(255), nullable=True)
    company_reg_no = Column(String(50), nullable=True, index=True)
    department = Column(String(100), nullable=True)
    field_of_expertise = Column(String(255), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    user_access = Column(Integer, default=1)
    user_type = Column(Integer, default=1)  # 1=regular, 2=directory
    CV_text = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="profiles")


class User(Base):
    """User authentication model"""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email_confirmed_at = Column(DateTime, nullable=True)
    last_sign_in_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class LDAPConnectorModel(Base):
    """LDAP Connector database model"""

    __tablename__ = "ldap_connectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    directory_type = Column(String(50), default="active_directory")
    domain = Column(String(255), nullable=True)
    host = Column(String(255), nullable=False)
    port = Column(Integer, default=389)
    username = Column(String(255), nullable=True)
    password = Column(String(255), nullable=True)
    base_dn = Column(String(500), nullable=True)
    user_dn = Column(String(500), nullable=True)
    group_dn = Column(String(500), nullable=True)
    is_ssl = Column(Boolean, default=False)
    sync_interval = Column(Integer, default=60)
    search_timeout = Column(Integer, default=30)

    # User schema attributes
    user_object = Column(String(100), nullable=True)
    user_object_filter = Column(String(500), nullable=True)
    attribute_username = Column(String(100), nullable=True)
    attribute_username_rdn = Column(String(100), nullable=True)
    attribute_first_name = Column(String(100), nullable=True)
    attribute_last_name = Column(String(100), nullable=True)
    attribute_display_name = Column(String(100), nullable=True)
    attribute_principal_name = Column(String(100), nullable=True)
    attribute_email = Column(String(100), nullable=True)
    attribute_user_guid = Column(String(100), nullable=True)
    attribute_user_groups = Column(String(100), nullable=True)

    # Group schema attributes
    group_object = Column(String(100), nullable=True)
    group_object_filter = Column(String(500), nullable=True)
    group_recursive = Column(Boolean, default=True)
    attribute_group_guid = Column(String(100), nullable=True)
    attribute_group_name = Column(String(100), nullable=True)
    attribute_group_description = Column(String(100), nullable=True)
    attribute_group_members = Column(String(100), nullable=True)

    # Status
    active = Column(Boolean, default=True)
    status = Column(String(50), default="inactive")
    last_sync = Column(DateTime, nullable=True)
    last_sync_status = Column(String(50), nullable=True)
    last_sync_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="ldap_connectors")


# ============================================================================
# Pydantic Models
# ============================================================================


class LDAPConnector(BaseModel):
    """Pydantic model for LDAP Connector response"""

    id: str
    company_id: str
    name: str
    directory_type: str | None = "active_directory"
    domain: str | None = None
    host: str
    port: int = 389
    username: str | None = None
    password: str | None = None
    base_dn: str | None = None
    user_dn: str | None = None
    group_dn: str | None = None
    is_ssl: bool = False
    sync_interval: int = 60
    search_timeout: int = 30
    user_object: str | None = None
    user_object_filter: str | None = None
    attribute_username: str | None = None
    attribute_username_rdn: str | None = None
    attribute_first_name: str | None = None
    attribute_last_name: str | None = None
    attribute_display_name: str | None = None
    attribute_principal_name: str | None = None
    attribute_email: str | None = None
    attribute_user_guid: str | None = None
    attribute_user_groups: str | None = None
    group_object: str | None = None
    group_object_filter: str | None = None
    group_recursive: bool = True
    attribute_group_guid: str | None = None
    attribute_group_name: str | None = None
    attribute_group_description: str | None = None
    attribute_group_members: str | None = None
    active: bool = True
    status: str | None = "inactive"
    last_sync: datetime | None = None

    class Config:
        from_attributes = True


# ============================================================================
# Database Dependency
# ============================================================================


async def get_async_db() -> AsyncSession:
    """Async database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ============================================================================
# Password Hashing (for user creation)
# ============================================================================


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


# ============================================================================
# Helper Functions
# ============================================================================


def connector_model_to_dict(connector: LDAPConnectorModel) -> dict:
    """Convert SQLAlchemy model to dictionary"""
    return {
        "id": str(connector.id),
        "company_id": str(connector.company_id),
        "name": connector.name,
        "directory_type": connector.directory_type,
        "domain": connector.domain,
        "host": connector.host,
        "port": connector.port,
        "username": connector.username,
        "password": connector.password,
        "base_dn": connector.base_dn,
        "user_dn": connector.user_dn,
        "group_dn": connector.group_dn,
        "is_ssl": connector.is_ssl,
        "sync_interval": connector.sync_interval,
        "search_timeout": connector.search_timeout,
        "user_object": connector.user_object,
        "user_object_filter": connector.user_object_filter,
        "attribute_username": connector.attribute_username,
        "attribute_username_rdn": connector.attribute_username_rdn,
        "attribute_first_name": connector.attribute_first_name,
        "attribute_last_name": connector.attribute_last_name,
        "attribute_display_name": connector.attribute_display_name,
        "attribute_principal_name": connector.attribute_principal_name,
        "attribute_email": connector.attribute_email,
        "attribute_user_guid": connector.attribute_user_guid,
        "attribute_user_groups": connector.attribute_user_groups,
        "group_object": connector.group_object,
        "group_object_filter": connector.group_object_filter,
        "group_recursive": connector.group_recursive,
        "attribute_group_guid": connector.attribute_group_guid,
        "attribute_group_name": connector.attribute_group_name,
        "attribute_group_description": connector.attribute_group_description,
        "attribute_group_members": connector.attribute_group_members,
        "active": connector.active,
        "status": connector.status,
        "last_sync": connector.last_sync,
    }


def connector_to_pydantic(connector: LDAPConnectorModel) -> LDAPConnector:
    """Convert SQLAlchemy model to Pydantic model"""
    return LDAPConnector(
        id=str(connector.id),
        company_id=str(connector.company_id),
        name=connector.name,
        directory_type=connector.directory_type,
        domain=connector.domain,
        host=connector.host,
        port=connector.port,
        username=connector.username,
        password=connector.password,
        base_dn=connector.base_dn,
        user_dn=connector.user_dn,
        group_dn=connector.group_dn,
        is_ssl=connector.is_ssl,
        sync_interval=connector.sync_interval,
        search_timeout=connector.search_timeout,
        user_object=connector.user_object,
        user_object_filter=connector.user_object_filter,
        attribute_username=connector.attribute_username,
        attribute_username_rdn=connector.attribute_username_rdn,
        attribute_first_name=connector.attribute_first_name,
        attribute_last_name=connector.attribute_last_name,
        attribute_display_name=connector.attribute_display_name,
        attribute_principal_name=connector.attribute_principal_name,
        attribute_email=connector.attribute_email,
        attribute_user_guid=connector.attribute_user_guid,
        attribute_user_groups=connector.attribute_user_groups,
        group_object=connector.group_object,
        group_object_filter=connector.group_object_filter,
        group_recursive=connector.group_recursive,
        attribute_group_guid=connector.attribute_group_guid,
        attribute_group_name=connector.attribute_group_name,
        attribute_group_description=connector.attribute_group_description,
        attribute_group_members=connector.attribute_group_members,
        active=connector.active,
        status=connector.status,
        last_sync=connector.last_sync,
    )


# ============================================================================
# Database Operations
# ============================================================================


async def db_create_ldap_connector(
    db: AsyncSession, connector_data: dict[str, Any]
) -> LDAPConnectorModel:
    """Create a new LDAP connector in database"""
    connector = LDAPConnectorModel(
        id=uuid.uuid4(),
        company_id=connector_data.get("company_id"),
        name=connector_data.get("name"),
        directory_type=connector_data.get("directory_type", "active_directory"),
        domain=connector_data.get("domain"),
        host=connector_data.get("host"),
        port=connector_data.get("port", 389),
        username=connector_data.get("username"),
        password=connector_data.get("password"),
        base_dn=connector_data.get("base_dn"),
        user_dn=connector_data.get("user_dn"),
        group_dn=connector_data.get("group_dn"),
        is_ssl=connector_data.get("is_ssl", False),
        sync_interval=connector_data.get("sync_interval", 60),
        search_timeout=connector_data.get("search_timeout", 30),
        user_object=connector_data.get("user_object"),
        user_object_filter=connector_data.get("user_object_filter"),
        attribute_username=connector_data.get("attribute_username"),
        attribute_username_rdn=connector_data.get("attribute_username_rdn"),
        attribute_first_name=connector_data.get("attribute_first_name"),
        attribute_last_name=connector_data.get("attribute_last_name"),
        attribute_display_name=connector_data.get("attribute_display_name"),
        attribute_principal_name=connector_data.get("attribute_principal_name"),
        attribute_email=connector_data.get("attribute_email"),
        attribute_user_guid=connector_data.get("attribute_user_guid"),
        attribute_user_groups=connector_data.get("attribute_user_groups"),
        group_object=connector_data.get("group_object"),
        group_object_filter=connector_data.get("group_object_filter"),
        group_recursive=connector_data.get("group_recursive", True),
        attribute_group_guid=connector_data.get("attribute_group_guid"),
        attribute_group_name=connector_data.get("attribute_group_name"),
        attribute_group_description=connector_data.get("attribute_group_description"),
        attribute_group_members=connector_data.get("attribute_group_members"),
        active=connector_data.get("active", True),
        status=connector_data.get("status", "inactive"),
    )
    db.add(connector)
    await db.commit()
    await db.refresh(connector)
    return connector


async def db_update_ldap_connector(
    db: AsyncSession, connector_id: str, connector_data: dict[str, Any]
) -> LDAPConnectorModel | None:
    """Update an existing LDAP connector"""
    result = await db.execute(
        select(LDAPConnectorModel).where(LDAPConnectorModel.id == connector_id)
    )
    connector = result.scalar_one_or_none()

    if not connector:
        return None

    # Update fields
    for key, value in connector_data.items():
        if hasattr(connector, key) and value is not None:
            setattr(connector, key, value)

    connector.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(connector)
    return connector


async def db_delete_ldap_connector(db: AsyncSession, connector_id: str) -> bool:
    """Delete an LDAP connector"""
    result = await db.execute(
        select(LDAPConnectorModel).where(LDAPConnectorModel.id == connector_id)
    )
    connector = result.scalar_one_or_none()

    if not connector:
        return False

    await db.delete(connector)
    await db.commit()
    return True


async def db_get_ldap_connector(db: AsyncSession, connector_id: str) -> LDAPConnectorModel | None:
    """Get an LDAP connector by ID"""
    result = await db.execute(
        select(LDAPConnectorModel).where(LDAPConnectorModel.id == connector_id)
    )
    return result.scalar_one_or_none()


async def db_get_ldap_connectors(
    db: AsyncSession, company_id: int | None = None
) -> list[LDAPConnectorModel]:
    """Get all LDAP connectors, optionally filtered by company"""
    query = select(LDAPConnectorModel)
    if company_id:
        query = query.where(LDAPConnectorModel.company_id == company_id)
    result = await db.execute(query)
    return result.scalars().all()


async def db_get_ldap_connector_by_company(
    db: AsyncSession, company_id: int
) -> LDAPConnectorModel | None:
    """Get LDAP connector for a specific company"""
    result = await db.execute(
        select(LDAPConnectorModel).where(LDAPConnectorModel.company_id == company_id)
    )
    return result.scalar_one_or_none()


async def db_get_profile_by_id(db: AsyncSession, user_id: str) -> Profile | None:
    """Get profile by user ID"""
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    return result.scalar_one_or_none()


async def db_get_profile_by_email(db: AsyncSession, email: str) -> Profile | None:
    """Get profile by email"""
    result = await db.execute(select(Profile).where(Profile.email == email))
    return result.scalar_one_or_none()


async def db_get_company_by_name(db: AsyncSession, name: str) -> Company | None:
    """Get company by name"""
    result = await db.execute(select(Company).where(Company.name == name))
    return result.scalar_one_or_none()


async def db_get_company_by_id(db: AsyncSession, company_id: int) -> Company | None:
    """Get company by ID"""
    result = await db.execute(select(Company).where(Company.id == company_id))
    return result.scalar_one_or_none()


async def db_create_user(db: AsyncSession, email: str, password: str) -> User:
    """Create a new user"""
    user = User(
        id=uuid.uuid4(),
        email=email,
        password_hash=hash_password(password),
        email_confirmed_at=datetime.utcnow(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def db_create_profile(db: AsyncSession, profile_data: dict[str, Any]) -> Profile:
    """Create a new profile"""
    profile = Profile(
        id=profile_data.get("id", uuid.uuid4()),
        user_id=profile_data.get("user_id"),
        email=profile_data.get("email"),
        full_name=profile_data.get("full_name"),
        username=profile_data.get("username"),
        telephone=profile_data.get("telephone"),
        company_id=profile_data.get("company_id"),
        company_name=profile_data.get("company_name"),
        department=profile_data.get("department"),
        field_of_expertise=profile_data.get("field_of_expertise"),
        years_of_experience=profile_data.get("years_of_experience"),
        CV_text=profile_data.get("CV_text"),
        user_type=profile_data.get("user_type", 1),
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def db_update_profile(
    db: AsyncSession, profile_id: str, profile_data: dict[str, Any]
) -> Profile | None:
    """Update an existing profile"""
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        return None

    for key, value in profile_data.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)

    profile.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(profile)
    return profile


# ============================================================================
# API Router
# ============================================================================

router = APIRouter(
    prefix="/api/ldap",
    tags=["ldap"],
    responses={404: {"description": "Not found"}},
)


@router.post("/connectors", status_code=status.HTTP_201_CREATED, response_model=dict[str, Any])
async def create_connector(
    connector_data: dict[str, Any],
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new LDAP connector
    """
    try:
        connector = await db_create_ldap_connector(db, connector_data)
        return {
            "message": "Connector created successfully",
            "data": connector_model_to_dict(connector),
        }
    except Exception as e:
        logger.error(f"Error creating LDAP connector: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.put("/connectors/{connector_id}", response_model=dict[str, Any])
async def update_connector(
    connector_id: str,
    connector_data: dict[str, Any],
    db: AsyncSession = Depends(get_async_db),
):
    """
    Update an existing LDAP connector
    """
    try:
        connector = await db_update_ldap_connector(db, connector_id, connector_data)
        if not connector:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"LDAP connector not found: {connector_id}",
            )
        return {
            "message": "Connector updated successfully",
            "data": connector_model_to_dict(connector),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating LDAP connector: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.delete("/connectors/{connector_id}", response_model=dict[str, Any])
async def delete_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Delete an LDAP connector
    """
    try:
        success = await db_delete_ldap_connector(db, connector_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"LDAP connector not found: {connector_id}",
            )
        return {"message": "Connector deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting LDAP connector: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.get("/connectors/{connector_id}", response_model=LDAPConnector)
async def get_connector(
    connector_id: str,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get an LDAP connector by ID
    """
    connector = await db_get_ldap_connector(db, connector_id)

    if not connector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LDAP connector not found: {connector_id}",
        )

    return connector_to_pydantic(connector)


@router.get("/connectors", response_model=list[LDAPConnector])
async def list_connectors(
    company_reg_no: str | None = None,
    company_id: int | None = None,
    db: AsyncSession = Depends(get_async_db),
):
    """
    List all LDAP connectors, optionally filtered by company
    """
    connectors = await db_get_ldap_connectors(db, company_id)
    return [connector_to_pydantic(c) for c in connectors]


@router.post("/test-connection", response_model=dict[str, Any])
async def test_connection(connector_data: dict[str, Any]):
    """
    Test connection to an LDAP server
    """
    result = await test_ldap_connection(connector_data)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


@router.post("/search", response_model=list[LDAPSearchResult])
async def search(search_data: LDAPSearchInputModel):
    """
    Search LDAP directory
    """
    results = await ldap_search(search_data)
    return results


@router.post("/authenticate", response_model=dict[str, Any])
async def authenticate(connector_id: str, credentials: LoginModel):
    """
    Authenticate a user against LDAP
    """
    auth_result = await ldap_authenticate(connector_id, credentials)

    return {
        "authenticated": auth_result,
        "message": ("Authentication successful" if auth_result else "Authentication failed"),
    }


@router.post("/sync/{connector_id}", response_model=dict[str, Any])
async def sync_connector(connector_id: str):
    """
    Synchronize users and groups with LDAP directory
    """
    result = await sync_ldap_connector(connector_id)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


# ============================================================================
# Directory-specific endpoints
# ============================================================================


@router.post("/directory/config", response_model=dict[str, Any])
async def create_directory_config(
    directory_data: dict[str, Any],
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create or update LDAP directory configuration
    """
    try:
        user_id = directory_data.get("user_id")

        # Convert frontend form data to backend model
        connector_data = {
            # Server Settings
            "name": directory_data.get("name"),
            "directory_type": directory_data.get("directoryType"),
            "domain": directory_data.get("domain"),
            "host": directory_data.get("host"),
            "port": directory_data.get("port"),
            "username": directory_data.get("username"),
            "password": directory_data.get("password"),
            "sync_interval": int(directory_data.get("syncInterval", 60)),
            "search_timeout": int(directory_data.get("searchTimeout", 60)),
            "base_dn": directory_data.get("baseDN"),
            "user_dn": directory_data.get("userDN"),
            "group_dn": directory_data.get("groupDN"),
            "is_ssl": directory_data.get("sslConnection", False),
            # User Schema
            "user_object": directory_data.get("userObject"),
            "user_object_filter": directory_data.get("userFilter"),
            "attribute_username": directory_data.get("userName"),
            "attribute_username_rdn": directory_data.get("userObjectRDN"),
            "attribute_first_name": directory_data.get("firstName"),
            "attribute_last_name": directory_data.get("lastName"),
            "attribute_display_name": directory_data.get("displayName"),
            "attribute_principal_name": directory_data.get("principalName"),
            "attribute_email": directory_data.get("email"),
            "attribute_user_guid": directory_data.get("uniqueId"),
            "attribute_user_groups": directory_data.get("userGroups"),
            # Group Schema
            "group_object": directory_data.get("groupObject"),
            "group_object_filter": directory_data.get("groupFilter"),
            "group_recursive": directory_data.get("fetchRecursively", True),
            "attribute_group_guid": directory_data.get("groupUniqueId"),
            "attribute_group_name": directory_data.get("groupName"),
            "attribute_group_description": directory_data.get("groupDescription"),
            "attribute_group_members": directory_data.get("groupMembers"),
            "company_id": None,
        }

        # Get the user's company_id from profile
        if user_id:
            profile = await db_get_profile_by_id(db, user_id)

            if profile and profile.company_id:
                connector_data["company_id"] = profile.company_id
            else:
                raise HTTPException(
                    status_code=400,
                    detail="User does not have a company associated with their profile",
                )

        # Check if a connector already exists for this company
        existing_connector = await db_get_ldap_connector_by_company(
            db, connector_data["company_id"]
        )

        if existing_connector:
            # Update existing connector
            connector = await db_update_ldap_connector(
                db, str(existing_connector.id), connector_data
            )
            message = "Connector updated successfully"
        else:
            # Create new connector
            connector = await db_create_ldap_connector(db, connector_data)
            message = "Connector created successfully"

        return {"message": message, "data": connector_model_to_dict(connector)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring LDAP directory: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error configuring LDAP directory: {str(e)}"
        ) from e


@router.get("/directory/config/{company_id}", response_model=dict[str, Any])
async def get_directory_config(
    company_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get LDAP directory configuration for a company
    """
    try:
        connector = await db_get_ldap_connector_by_company(db, company_id)

        if not connector:
            return {"exists": False}

        # Transform to frontend format
        result = {
            "exists": True,
            "directoryType": connector.directory_type,
            "name": connector.name,
            "domain": connector.domain,
            "host": connector.host,
            "port": connector.port,
            "username": connector.username,
            "password": connector.password,
            "syncInterval": str(connector.sync_interval),
            "searchTimeout": str(connector.search_timeout),
            "baseDN": connector.base_dn,
            "userDN": connector.user_dn,
            "groupDN": connector.group_dn,
            "sslConnection": connector.is_ssl,
            "userObject": connector.user_object,
            "userFilter": connector.user_object_filter,
            "userName": connector.attribute_username,
            "userObjectRDN": connector.attribute_username_rdn,
            "firstName": connector.attribute_first_name,
            "lastName": connector.attribute_last_name,
            "displayName": connector.attribute_display_name,
            "principalName": connector.attribute_principal_name,
            "email": connector.attribute_email,
            "uniqueId": connector.attribute_user_guid,
            "userGroups": connector.attribute_user_groups,
            "groupObject": connector.group_object,
            "groupFilter": connector.group_object_filter,
            "fetchRecursively": connector.group_recursive,
            "groupUniqueId": connector.attribute_group_guid,
            "groupName": connector.attribute_group_name,
            "groupDescription": connector.attribute_group_description,
            "groupMembers": connector.attribute_group_members,
            "status": connector.status,
            "lastSync": connector.last_sync,
        }

        return result

    except Exception as e:
        logger.error(f"Error fetching LDAP directory config: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching LDAP directory config: {str(e)}"
        ) from e


@router.post("/directory/test-connection", response_model=dict[str, Any])
async def test_directory_connection(directory_data: dict[str, Any]):
    """
    Test connection to an LDAP directory
    """
    try:
        # Convert frontend form data to test format
        connection_data = {
            "name": directory_data.get("name"),
            "domain": directory_data.get("domain"),
            "host": directory_data.get("host"),
            "port": directory_data.get("port"),
            "username": directory_data.get("username"),
            "password": directory_data.get("password"),
            "company_id": directory_data.get("company_id"),
            "base_dn": directory_data.get("base_dn"),
            "user_dn": directory_data.get("user_dn"),
            "group_dn": directory_data.get("group_dn"),
            "is_ssl": directory_data.get("is_ssl", False),
            "sync_interval": int(directory_data.get("sync_interval", 60)),
            "search_timeout": int(directory_data.get("search_timeout", 30)),
            "user_object": directory_data.get("user_object"),
            "user_object_filter": directory_data.get("user_object_filter"),
            "attribute_username": directory_data.get("attribute_username"),
            "attribute_username_rdn": directory_data.get("attribute_username_rdn"),
            "attribute_first_name": directory_data.get("attribute_first_name"),
            "attribute_last_name": directory_data.get("attribute_last_name"),
            "attribute_display_name": directory_data.get("attribute_display_name"),
            "attribute_principal_name": directory_data.get("attribute_principal_name"),
            "attribute_email": directory_data.get("attribute_email"),
            "attribute_user_guid": directory_data.get("attribute_user_guid"),
            "attribute_user_groups": directory_data.get("attribute_user_groups"),
            "group_object": directory_data.get("group_object"),
            "group_object_filter": directory_data.get("group_object_filter"),
            "attribute_group_guid": directory_data.get("attribute_group_guid"),
            "attribute_group_name": directory_data.get("attribute_group_name"),
            "attribute_group_description": directory_data.get("attribute_group_description"),
            "attribute_group_members": directory_data.get("attribute_group_members"),
            "group_recursive": directory_data.get("group_recursive", False),
            "active": directory_data.get("active", False),
            "directory_type": directory_data.get("directory_type", "active_directory"),
            "status": directory_data.get("status", "inactive"),
            "bypass_cert_verification": True,
        }

        result = await test_ldap_connection(connection_data)
        return result

    except Exception as e:
        logger.error(f"Error testing LDAP connection: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error testing LDAP connection: {str(e)}"
        ) from e


@router.post("/directory/sync/{company_id}", response_model=dict[str, Any])
async def sync_directory(
    company_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Synchronize users and groups from LDAP directory
    """
    try:
        connector = await db_get_ldap_connector_by_company(db, company_id)

        if not connector:
            raise HTTPException(status_code=404, detail="No LDAP connector found for this company")

        result = await sync_ldap_connector(str(connector.id))
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error syncing LDAP directory: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error syncing LDAP directory: {str(e)}"
        ) from e


@router.get("/directory/users/{company_id}", response_model=list[dict[str, Any]])
async def get_directory_users(
    company_id: int,
    query: str | None = None,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get users from LDAP directory, optionally filtered by search query
    """
    try:
        connector = await db_get_ldap_connector_by_company(db, company_id)

        if not connector:
            raise HTTPException(status_code=404, detail="No LDAP connector found for this company")

        # Convert to pydantic model for service
        connector_pydantic = connector_to_pydantic(connector)

        # Search LDAP for users
        search_input = LDAPSearchInputModel(query=query or "*", connectorId=connector_pydantic.id)

        results = await ldap_search(search_input)

        # Filter only user results (not groups)
        users = [result.dict() for result in results if result.type == "user"]

        return users

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching LDAP users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching LDAP users: {str(e)}") from e


@router.post("/directory/import-user", response_model=dict[str, Any])
async def import_user_from_directory(
    data: dict[str, Any],
    db: AsyncSession = Depends(get_async_db),
):
    """
    Import a user from LDAP directory to Vault
    """
    try:
        user_data = data.get("userData")
        ldap_data = data.get("ldapData")

        if not user_data or not ldap_data:
            raise HTTPException(status_code=400, detail="Missing user data or LDAP data")

        # Format the data
        org_data = {
            "firstName": ldap_data.get("firstName", ""),
            "lastName": ldap_data.get("lastName", ""),
            "email": ldap_data.get("email", ""),
            "telephone": user_data.get("telephone", ""),
            "company": user_data.get("company", ""),
        }

        try:
            # Find the company by name
            company = await db_get_company_by_name(db, org_data["company"])

            if not company:
                # Try using company_id if provided
                company_id = user_data.get("company_id")
                if company_id:
                    company = await db_get_company_by_id(db, company_id)
                    if company:
                        org_data["company"] = company.name
                    else:
                        raise HTTPException(
                            status_code=404,
                            detail=f"Company with ID '{company_id}' not found",
                        )
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Company with name '{org_data['company']}' not found",
                    )

            # Create profile data
            profile_data = {
                "full_name": f"{org_data['firstName']} {org_data['lastName']}",
                "email": org_data["email"],
                "telephone": org_data["telephone"],
                "company_id": company.id,
                "company_name": org_data["company"],
                "department": user_data.get("department", ""),
                "field_of_expertise": user_data.get("field_of_expertise", ""),
                "years_of_experience": user_data.get("years_of_experience"),
                "CV_text": user_data.get("CV_text", ""),
                "user_type": user_data.get("user_type", 2),
            }

            # Check if user exists by email
            existing_profile = await db_get_profile_by_email(db, profile_data["email"])

            if existing_profile:
                # Update existing user
                profile = await db_update_profile(db, str(existing_profile.id), profile_data)
                message = "User updated successfully"
            else:
                # Create new user with random password
                password = "".join(random.choices(string.ascii_letters + string.digits, k=12))
                username = (
                    f"{org_data['firstName'].lower()[0]}"
                    f"{org_data['lastName'].lower()}"
                    f"{random.randint(1000, 9999)}"
                )

                # Create user in auth table
                user = await db_create_user(db, profile_data["email"], password)

                profile_data["id"] = user.id
                profile_data["user_id"] = user.id
                profile_data["username"] = username

                profile = await db_create_profile(db, profile_data)

                # Send welcome email with temporary password
                await send_welcome_email(profile_data["email"], password, username)
                message = "User imported successfully"

            return {
                "message": message,
                "data": {
                    "id": str(profile.id),
                    "email": profile.email,
                    "full_name": profile.full_name,
                    "username": profile.username,
                },
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in user import processing: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error creating/updating user: {str(e)}"
            ) from e

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing LDAP user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error importing LDAP user: {str(e)}") from e


# ============================================================================
# Bulk Operations
# ============================================================================


@router.post("/directory/import-users", response_model=dict[str, Any])
async def import_users_from_directory(
    data: dict[str, Any],
    db: AsyncSession = Depends(get_async_db),
):
    """
    Import multiple users from LDAP directory to Vault
    """
    try:
        users_data = data.get("users", [])
        company_id = data.get("company_id")

        if not users_data:
            raise HTTPException(status_code=400, detail="No users provided")

        if not company_id:
            raise HTTPException(status_code=400, detail="Company ID is required")

        company = await db_get_company_by_id(db, company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with ID '{company_id}' not found")

        imported = 0
        updated = 0
        failed = 0
        errors = []

        for ldap_user in users_data:
            try:
                email = ldap_user.get("email")
                if not email:
                    failed += 1
                    errors.append({"user": ldap_user, "error": "Email is required"})
                    continue

                # Check if user exists
                existing_profile = await db_get_profile_by_email(db, email)

                profile_data = {
                    "full_name": (
                        f"{ldap_user.get('firstName', '')} " f"{ldap_user.get('lastName', '')}"
                    ).strip(),
                    "email": email,
                    "company_id": company.id,
                    "company_name": company.name,
                    "user_type": 2,  # Directory user
                }

                if existing_profile:
                    await db_update_profile(db, str(existing_profile.id), profile_data)
                    updated += 1
                else:
                    # Create new user
                    password = "".join(random.choices(string.ascii_letters + string.digits, k=12))
                    first_name = ldap_user.get("firstName", "user")
                    last_name = ldap_user.get("lastName", "")
                    username = (
                        f"{first_name.lower()[0] if first_name else 'u'}"
                        f"{last_name.lower() if last_name else 'user'}"
                        f"{random.randint(1000, 9999)}"
                    )

                    user = await db_create_user(db, email, password)
                    profile_data["id"] = user.id
                    profile_data["user_id"] = user.id
                    profile_data["username"] = username

                    await db_create_profile(db, profile_data)
                    await send_welcome_email(email, password, username)
                    imported += 1

            except Exception as e:
                failed += 1
                errors.append({"user": ldap_user, "error": str(e)})
                logger.error(f"Error importing user {ldap_user.get('email')}: {str(e)}")

        return {
            "message": "Bulk import completed",
            "imported": imported,
            "updated": updated,
            "failed": failed,
            "errors": errors if errors else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk import: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in bulk import: {str(e)}") from e


# ============================================================================
# Status and Health Endpoints
# ============================================================================


@router.get("/directory/status/{company_id}", response_model=dict[str, Any])
async def get_directory_status(
    company_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get LDAP directory sync status for a company
    """
    try:
        connector = await db_get_ldap_connector_by_company(db, company_id)

        if not connector:
            return {
                "configured": False,
                "message": "No LDAP connector configured for this company",
            }

        return {
            "configured": True,
            "status": connector.status,
            "last_sync": connector.last_sync,
            "last_sync_status": connector.last_sync_status,
            "last_sync_message": connector.last_sync_message,
            "active": connector.active,
        }

    except Exception as e:
        logger.error(f"Error getting directory status: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error getting directory status: {str(e)}"
        ) from e


@router.post("/directory/activate/{company_id}", response_model=dict[str, Any])
async def activate_directory(
    company_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Activate LDAP directory connector for a company
    """
    try:
        connector = await db_get_ldap_connector_by_company(db, company_id)

        if not connector:
            raise HTTPException(status_code=404, detail="No LDAP connector found for this company")

        connector.active = True
        connector.status = "active"
        connector.updated_at = datetime.utcnow()
        await db.commit()

        return {"message": "Directory connector activated", "status": "active"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error activating directory: {str(e)}") from e


@router.post("/directory/deactivate/{company_id}", response_model=dict[str, Any])
async def deactivate_directory(
    company_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Deactivate LDAP directory connector for a company
    """
    try:
        connector = await db_get_ldap_connector_by_company(db, company_id)

        if not connector:
            raise HTTPException(status_code=404, detail="No LDAP connector found for this company")

        connector.active = False
        connector.status = "inactive"
        connector.updated_at = datetime.utcnow()
        await db.commit()

        return {"message": "Directory connector deactivated", "status": "inactive"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating directory: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error deactivating directory: {str(e)}"
        ) from e


# ============================================================================
# Database Initialization
# ============================================================================


async def init_ldap_tables():
    """Initialize LDAP-related database tables"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("LDAP database tables initialized successfully")
