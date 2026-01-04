"""
Authentication Service
Handles user authentication, registration, and JWT token management
Converted from Supabase to SQLAlchemy
"""

import logging
import secrets
import uuid
from datetime import datetime, timedelta

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from app.config import settings

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

# Password hashing context (bcrypt compatible)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ============================================================================
# SQLAlchemy Models
# ============================================================================


class User(Base):
    """User authentication model"""

    __tablename__ = "auth_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    encrypted_password = Column(String(255), nullable=True)
    email_confirmed_at = Column(DateTime, nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    last_sign_in_at = Column(DateTime, nullable=True)

    # Metadata fields
    raw_app_meta_data = Column(JSON, default=dict)
    raw_user_meta_data = Column(JSON, default=dict)

    # Recovery/reset fields
    recovery_token = Column(String(255), nullable=True, index=True)
    recovery_sent_at = Column(DateTime, nullable=True)

    # Status fields
    is_active = Column(Boolean, default=True)
    banned_until = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship(
        "Profile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def email_confirmed(self) -> bool:
        """Check if email is confirmed"""
        return self.email_confirmed_at is not None

    @property
    def is_banned(self) -> bool:
        """Check if user is currently banned"""
        if self.banned_until is None:
            return False
        return self.banned_until > datetime.utcnow()


class Profile(Base):
    """User profile model"""

    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("auth_users.id", ondelete="CASCADE"),
        nullable=True,
        unique=True,
    )
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    telephone = Column(String(50), nullable=True)

    # Company fields
    company_id = Column(Integer, nullable=True, index=True)
    company_name = Column(String(255), nullable=True)
    company_reg_no = Column(String(50), nullable=True, index=True)

    # Profile fields
    department = Column(String(100), nullable=True)
    field_of_expertise = Column(String(255), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    user_access = Column(Integer, default=1)
    user_type = Column(Integer, default=1)

    # Extended fields
    CV_text = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Status
    status = Column(String(50), default="active")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    user_roles = relationship("UserRole", back_populates="profile", cascade="all, delete-orphan")


class Role(Base):
    """Role model for RBAC"""

    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user_roles = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")


class UserRole(Base):
    """User-Role association model"""

    __tablename__ = "user_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id = Column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_reg_no = Column(String(50), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")


class RefreshToken(Base):
    """Refresh token storage for token rotation"""

    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("auth_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")

    @property
    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not revoked)"""
        if self.revoked_at is not None:
            return False
        return self.expires_at > datetime.utcnow()


# ============================================================================
# Pydantic Schemas
# ============================================================================


class UserCreate(BaseModel):
    """Schema for user creation"""

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
    user_access: int = 1
    email_confirmed: bool = False


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """Schema for user response"""

    id: str
    email: str
    full_name: str | None = None
    username: str | None = None
    company_reg_no: str | None = None
    roles: list[str] = []

    class Config:
        from_attributes = True


# ============================================================================
# Database Session Dependency
# ============================================================================


async def get_async_db() -> AsyncSession:
    """Async database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ============================================================================
# Authentication Service Class
# ============================================================================


class AuthService:
    """Authentication service for user management"""

    # -------------------------------------------------------------------------
    # Password Utilities
    # -------------------------------------------------------------------------

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    # -------------------------------------------------------------------------
    # JWT Token Management
    # -------------------------------------------------------------------------

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()

        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})

        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create a JWT refresh token"""
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        to_encode = {"sub": user_id, "exp": expire, "iat": datetime.utcnow(), "type": "refresh"}

        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode and verify a JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.JWTError as e:
            raise ValueError(f"Invalid token: {str(e)}")

    # -------------------------------------------------------------------------
    # Refresh Token Storage
    # -------------------------------------------------------------------------

    @staticmethod
    async def store_refresh_token(db: AsyncSession, user_id: str, token: str) -> RefreshToken:
        """Store a refresh token in database"""
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        db.add(refresh_token)
        await db.commit()
        return refresh_token

    @staticmethod
    async def revoke_refresh_token(db: AsyncSession, token: str) -> bool:
        """Revoke a refresh token"""
        result = await db.execute(select(RefreshToken).where(RefreshToken.token == token))
        refresh_token = result.scalar_one_or_none()

        if refresh_token:
            refresh_token.revoked_at = datetime.utcnow()
            await db.commit()
            return True
        return False

    @staticmethod
    async def revoke_all_user_tokens(db: AsyncSession, user_id: str) -> int:
        """Revoke all refresh tokens for a user"""
        result = await db.execute(
            select(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .where(RefreshToken.revoked_at.is_(None))
        )
        tokens = result.scalars().all()

        count = 0
        for token in tokens:
            token.revoked_at = datetime.utcnow()
            count += 1

        await db.commit()
        return count

    @staticmethod
    async def is_refresh_token_valid(db: AsyncSession, token: str) -> bool:
        """Check if a refresh token is valid"""
        result = await db.execute(
            select(RefreshToken)
            .where(RefreshToken.token == token)
            .where(RefreshToken.revoked_at.is_(None))
            .where(RefreshToken.expires_at > datetime.utcnow())
        )
        return result.scalar_one_or_none() is not None

    # -------------------------------------------------------------------------
    # User Creation
    # -------------------------------------------------------------------------

    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate,
        company_reg_no: str | None = None,
        created_by: str | None = None,
    ) -> Profile:
        """Create a new user with profile"""
        try:
            user_id = uuid.uuid4()

            # Check if email exists
            result = await db.execute(select(User).where(User.email == user_data.email))
            if result.scalar_one_or_none():
                raise ValueError(f"Email '{user_data.email}' is already registered")

            # Check if username exists
            if user_data.username:
                result = await db.execute(
                    select(Profile).where(Profile.username == user_data.username)
                )
                if result.scalar_one_or_none():
                    raise ValueError(f"Username '{user_data.username}' is already taken")

            # Hash password
            hashed_password = AuthService.hash_password(user_data.password)

            # Build full name
            full_name = user_data.full_name
            if not full_name and (user_data.first_name or user_data.last_name):
                full_name = f"{user_data.first_name or ''} {user_data.last_name or ''}".strip()

            # Create user
            now = datetime.utcnow()
            new_user = User(
                id=user_id,
                email=user_data.email,
                encrypted_password=hashed_password,
                email_confirmed_at=now if user_data.email_confirmed else None,
                confirmed_at=now if user_data.email_confirmed else None,
                created_at=now,
                updated_at=now,
                raw_app_meta_data={},
                raw_user_meta_data={"full_name": full_name} if full_name else {},
            )
            db.add(new_user)

            # Create profile
            new_profile = Profile(
                id=str(user_id),
                user_id=user_id,
                email=user_data.email,
                full_name=full_name,
                username=user_data.username,
                telephone=user_data.telephone,
                company_id=user_data.company_id,
                company_name=user_data.company_name,
                company_reg_no=company_reg_no or user_data.company_reg_no,
                department=user_data.department,
                user_access=user_data.user_access,
                status="active",
                created_at=now,
                updated_at=now,
            )
            db.add(new_profile)

            await db.commit()
            await db.refresh(new_profile)

            logger.info(f"Created user: {user_id} ({user_data.email})")
            return new_profile

        except ValueError:
            await db.rollback()
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise

    # -------------------------------------------------------------------------
    # User Authentication
    # -------------------------------------------------------------------------

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, email: str, password: str
    ) -> tuple[User, Profile] | None:
        """Authenticate a user by email and password"""
        try:
            # Get user by email
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user:
                logger.warning(f"Authentication failed: User not found - {email}")
                return None

            # Check if deleted
            if user.deleted_at:
                logger.warning(f"Authentication failed: User deleted - {email}")
                return None

            # Check if banned
            if user.is_banned:
                logger.warning(f"Authentication failed: User banned - {email}")
                return None

            # Verify password
            if not user.encrypted_password:
                logger.warning(f"Authentication failed: No password set - {email}")
                return None

            if not AuthService.verify_password(password, user.encrypted_password):
                logger.warning(f"Authentication failed: Invalid password - {email}")
                return None

            # Check if active
            if not user.is_active:
                logger.warning(f"Authentication failed: User inactive - {email}")
                return None

            # Get profile
            result = await db.execute(select(Profile).where(Profile.id == str(user.id)))
            profile = result.scalar_one_or_none()

            if not profile:
                logger.error(f"Profile not found for user: {user.id}")
                return None

            if profile.status == "inactive":
                logger.warning(f"Authentication failed: Profile inactive - {email}")
                return None

            logger.info(f"User authenticated: {email}")
            return user, profile

        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None

    # -------------------------------------------------------------------------
    # User Management
    # -------------------------------------------------------------------------

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
        """Get user by ID"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        """Get user by email"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_profile_by_id(db: AsyncSession, profile_id: str) -> Profile | None:
        """Get profile by ID"""
        result = await db.execute(select(Profile).where(Profile.id == profile_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_profile_by_email(db: AsyncSession, email: str) -> Profile | None:
        """Get profile by email"""
        result = await db.execute(select(Profile).where(Profile.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_profile_by_username(db: AsyncSession, username: str) -> Profile | None:
        """Get profile by username"""
        result = await db.execute(select(Profile).where(Profile.username == username))
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        """Soft delete a user"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                logger.warning(f"User not found for deletion: {user_id}")
                return False

            user.deleted_at = datetime.utcnow()
            user.is_active = False
            user.updated_at = datetime.utcnow()

            # Update profile
            result = await db.execute(select(Profile).where(Profile.id == str(user_id)))
            profile = result.scalar_one_or_none()
            if profile:
                profile.status = "deleted"
                profile.updated_at = datetime.utcnow()

            await db.commit()
            logger.info(f"Soft deleted user: {user_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise

    @staticmethod
    async def deactivate_user(db: AsyncSession, user_id: str) -> bool:
        """Deactivate (ban) a user"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                logger.warning(f"User not found for deactivation: {user_id}")
                return False

            # Ban for 100 years
            user.banned_until = datetime.utcnow() + timedelta(days=36500)
            user.updated_at = datetime.utcnow()

            # Update profile
            result = await db.execute(select(Profile).where(Profile.id == str(user_id)))
            profile = result.scalar_one_or_none()
            if profile:
                profile.status = "inactive"
                profile.updated_at = datetime.utcnow()

            await db.commit()
            logger.info(f"Deactivated user: {user_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deactivating user: {str(e)}")
            raise

    @staticmethod
    async def reactivate_user(db: AsyncSession, user_id: str) -> bool:
        """Reactivate a user"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                logger.warning(f"User not found for reactivation: {user_id}")
                return False

            user.banned_until = None
            user.is_active = True
            user.deleted_at = None
            user.updated_at = datetime.utcnow()

            # Update profile
            result = await db.execute(select(Profile).where(Profile.id == str(user_id)))
            profile = result.scalar_one_or_none()
            if profile:
                profile.status = "active"
                profile.updated_at = datetime.utcnow()

            await db.commit()
            logger.info(f"Reactivated user: {user_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error reactivating user: {str(e)}")
            raise

    # -------------------------------------------------------------------------
    # Password Management
    # -------------------------------------------------------------------------

    @staticmethod
    async def update_password(db: AsyncSession, user_id: str, new_password: str) -> bool:
        """Update user password"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                return False

            user.encrypted_password = AuthService.hash_password(new_password)
            user.updated_at = datetime.utcnow()
            await db.commit()

            logger.info(f"Updated password for user: {user_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating password: {str(e)}")
            raise

    @staticmethod
    async def create_password_reset_token(db: AsyncSession, email: str) -> str | None:
        """Create a password reset token"""
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user:
                logger.warning(f"Password reset for non-existent email: {email}")
                return None

            reset_token = secrets.token_urlsafe(32)
            user.recovery_token = reset_token
            user.recovery_sent_at = datetime.utcnow()
            await db.commit()

            logger.info(f"Created password reset token for: {user.id}")
            return reset_token

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating reset token: {str(e)}")
            return None

    @staticmethod
    async def verify_password_reset_token(
        db: AsyncSession, email: str, token: str, expiry_hours: int = 1
    ) -> User | None:
        """Verify password reset token"""
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user or not user.recovery_token:
                return None

            if user.recovery_token != token:
                return None

            if user.recovery_sent_at:
                expiry = user.recovery_sent_at + timedelta(hours=expiry_hours)
                if datetime.utcnow() > expiry:
                    return None

            return user

        except Exception as e:
            logger.error(f"Error verifying reset token: {str(e)}")
            return None

    @staticmethod
    async def reset_password_with_token(
        db: AsyncSession, email: str, token: str, new_password: str
    ) -> bool:
        """Reset password using token"""
        try:
            user = await AuthService.verify_password_reset_token(db, email, token)

            if not user:
                return False

            user.encrypted_password = AuthService.hash_password(new_password)
            user.recovery_token = None
            user.recovery_sent_at = None
            user.updated_at = datetime.utcnow()

            await db.commit()
            logger.info(f"Password reset successful for: {user.id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error resetting password: {str(e)}")
            return False

    # -------------------------------------------------------------------------
    # Role Management
    # -------------------------------------------------------------------------

    @staticmethod
    async def get_user_roles(
        db: AsyncSession, user_id: str, company_reg_no: str | None = None
    ) -> list[str]:
        """Get user roles"""
        try:
            query = (
                select(Role.name)
                .join(UserRole, UserRole.role_id == Role.id)
                .where(UserRole.user_id == user_id)
            )

            if company_reg_no:
                query = query.where(UserRole.company_reg_no == company_reg_no)

            result = await db.execute(query)
            return [row[0] for row in result.fetchall()]

        except Exception as e:
            logger.error(f"Error getting user roles: {str(e)}")
            return []

    @staticmethod
    async def assign_role(
        db: AsyncSession, user_id: str, role_name: str, company_reg_no: str | None = None
    ) -> bool:
        """Assign role to user"""
        try:
            # Get role
            result = await db.execute(select(Role).where(Role.name == role_name))
            role = result.scalar_one_or_none()

            if not role:
                logger.warning(f"Role not found: {role_name}")
                return False

            # Check if already assigned
            query = (
                select(UserRole)
                .where(UserRole.user_id == user_id)
                .where(UserRole.role_id == role.id)
            )
            if company_reg_no:
                query = query.where(UserRole.company_reg_no == company_reg_no)

            result = await db.execute(query)
            if result.scalar_one_or_none():
                return True  # Already assigned

            # Assign role
            user_role = UserRole(
                user_id=user_id,
                role_id=role.id,
                company_reg_no=company_reg_no,
            )
            db.add(user_role)
            await db.commit()

            logger.info(f"Assigned role '{role_name}' to user: {user_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error assigning role: {str(e)}")
            return False

    @staticmethod
    async def remove_role(
        db: AsyncSession, user_id: str, role_name: str, company_reg_no: str | None = None
    ) -> bool:
        """Remove role from user"""
        try:
            result = await db.execute(select(Role).where(Role.name == role_name))
            role = result.scalar_one_or_none()

            if not role:
                return False

            query = (
                select(UserRole)
                .where(UserRole.user_id == user_id)
                .where(UserRole.role_id == role.id)
            )
            if company_reg_no:
                query = query.where(UserRole.company_reg_no == company_reg_no)

            result = await db.execute(query)
            user_role = result.scalar_one_or_none()

            if user_role:
                await db.delete(user_role)
                await db.commit()
                logger.info(f"Removed role '{role_name}' from user: {user_id}")
                return True

            return False

        except Exception as e:
            await db.rollback()
            logger.error(f"Error removing role: {str(e)}")
            return False

    # -------------------------------------------------------------------------
    # Get User with Full Data
    # -------------------------------------------------------------------------

    @staticmethod
    async def get_user_with_roles(
        db: AsyncSession, user_id: str, company_reg_no: str | None = None
    ) -> dict | None:
        """Get user with profile and roles"""
        try:
            # Get user
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user or not user.is_active or user.deleted_at:
                return None

            # Get profile
            result = await db.execute(select(Profile).where(Profile.id == str(user_id)))
            profile = result.scalar_one_or_none()

            if not profile:
                return None

            # Get roles
            roles = await AuthService.get_user_roles(db, str(user_id), company_reg_no)

            return {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "is_active": user.is_active,
                    "email_confirmed": user.email_confirmed,
                },
                "profile": {
                    "id": str(profile.id),
                    "full_name": profile.full_name,
                    "email": profile.email,
                    "username": profile.username,
                    "telephone": profile.telephone,
                    "company_id": profile.company_id,
                    "company_name": profile.company_name,
                    "company_reg_no": profile.company_reg_no,
                    "department": profile.department,
                    "user_access": profile.user_access,
                    "status": profile.status,
                },
                "roles": roles,
                "company_reg_no": profile.company_reg_no,
            }

        except Exception as e:
            logger.error(f"Error getting user with roles: {str(e)}")
            return None


# ============================================================================
# Current User Dependency
# ============================================================================


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_async_db)
) -> dict:
    """FastAPI dependency to get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = AuthService.decode_token(token)

        if payload.get("type") != "access":
            raise credentials_exception

        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

        user_data = await AuthService.get_user_with_roles(db, user_id)

        if not user_data:
            raise credentials_exception

        return user_data

    except ValueError:
        raise credentials_exception
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise credentials_exception


def require_roles(*required_roles: str):
    """Dependency factory for role-based access control"""

    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_roles = current_user.get("roles", [])

        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_checker


def require_access_level(min_level: int):
    """Dependency factory for access level checking"""

    async def access_checker(current_user: dict = Depends(get_current_user)):
        user_access = current_user.get("profile", {}).get("user_access", 0)

        if user_access < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient access level",
            )

        return current_user

    return access_checker


# ============================================================================
# Database Initialization
# ============================================================================


async def init_auth_tables():
    """Initialize authentication database tables"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Authentication tables initialized")


async def create_default_roles(db: AsyncSession):
    """Create default roles if they don't exist"""
    default_roles = [
        ("admin", "Administrator with full access"),
        ("user", "Standard user"),
        ("moderator", "Content moderator"),
        ("viewer", "Read-only access"),
    ]

    for name, description in default_roles:
        result = await db.execute(select(Role).where(Role.name == name))
        if not result.scalar_one_or_none():
            role = Role(name=name, description=description)
            db.add(role)

    await db.commit()
    logger.info("Default roles created")


async def cleanup_expired_tokens(db: AsyncSession):
    """Clean up expired and revoked refresh tokens"""
    result = await db.execute(
        select(RefreshToken).where(
            (RefreshToken.expires_at < datetime.utcnow()) | (RefreshToken.revoked_at.isnot(None))
        )
    )
    tokens = result.scalars().all()

    for token in tokens:
        await db.delete(token)

    await db.commit()
    logger.info(f"Cleaned up {len(tokens)} expired/revoked tokens")
