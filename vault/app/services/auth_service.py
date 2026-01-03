"""
Authentication Service
Handles user authentication, registration, and JWT token management
Works with Supabase auth.users schema
"""

import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4

import jwt
from passlib.context import CryptContext
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.models.profile import Profile
from app.models.role import Role, UserRole
from app.schemas.auth import UserCreate, UserLogin

logger = logging.getLogger(__name__)

# Password hashing context (compatible with Supabase bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service for user management"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt (compatible with Supabase)"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create a JWT refresh token"""
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode and verify a JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.JWTError as e:
            raise ValueError(f"Invalid token: {str(e)}")
    
    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate,
        company_reg_no: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> Profile:
        """
        Create a new user with profile
        Replaces: supabase_admin.auth.admin.create_user()
        """
        try:
            # Generate user ID
            user_id = uuid4()
            
            # Check if email already exists
            stmt = select(User).where(User.email == user_data.email)
            result = await db.execute(stmt)
            if result.scalar_one_or_none():
                raise ValueError(f"Email '{user_data.email}' is already registered")
            
            # Check if username already exists (if provided)
            if user_data.username:
                stmt = select(Profile).where(Profile.username == user_data.username)
                result = await db.execute(stmt)
                if result.scalar_one_or_none():
                    raise ValueError(f"Username '{user_data.username}' is already taken")
            
            # Hash password
            hashed_password = AuthService.hash_password(user_data.password)
            
            # Create user in auth.users (Supabase schema)
            now = datetime.utcnow()
            new_user = User(
                id=user_id,
                email=user_data.email,
                encrypted_password=hashed_password,  # Supabase field name
                email_confirmed_at=now if user_data.email_confirmed else None,
                confirmed_at=now if user_data.email_confirmed else None,
                created_at=now,
                updated_at=now,
                raw_app_meta_data={},
                raw_user_meta_data={
                    "full_name": user_data.full_name or f"{user_data.first_name} {user_data.last_name}"
                }
            )
            db.add(new_user)
            
            # Create profile in public.profiles
            full_name = user_data.full_name or f"{user_data.first_name} {user_data.last_name}"
            
            new_profile = Profile(
                id=str(user_id),
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
                updated_at=now
            )
            db.add(new_profile)
            
            await db.commit()
            await db.refresh(new_profile)
            
            logger.info(f"Created user: {user_id} ({user_data.email})")
            return new_profile
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str
    ) -> Optional[tuple[User, Profile]]:
        """
        Authenticate a user by email and password
        Replaces: supabase.auth.sign_in_with_password()
        """
        try:
            # Get user by email from auth.users
            stmt = select(User).where(User.email == email)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                logger.warning(f"Authentication failed: User not found - {email}")
                return None
            
            # Verify password
            if not user.encrypted_password:
                logger.warning(f"Authentication failed: No password set - {email}")
                return None
                
            if not AuthService.verify_password(password, user.encrypted_password):
                logger.warning(f"Authentication failed: Invalid password - {email}")
                return None
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Authentication failed: User inactive - {email}")
                return None
            
            # Get profile from public.profiles
            stmt = select(Profile).where(Profile.id == str(user.id))
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()
            
            if not profile:
                logger.error(f"Profile not found for user: {user.id}")
                return None
            
            # Check profile status
            if profile.status == "inactive":
                logger.warning(f"Authentication failed: Profile inactive - {email}")
                return None
            
            logger.info(f"User authenticated successfully: {email}")
            return user, profile
            
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None
    
    @staticmethod
    async def delete_user(
        db: AsyncSession,
        user_id: str
    ) -> bool:
        """
        Delete a user (hard delete)
        Replaces: supabase_admin.auth.admin.delete_user()
        """
        try:
            # Delete from auth.users (cascade will delete profile via FK)
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user:
                # Set deleted_at instead of hard delete (Supabase soft delete pattern)
                user.deleted_at = datetime.utcnow()
                await db.commit()
                logger.info(f"Soft deleted user: {user_id}")
                return True
            
            logger.warning(f"User not found for deletion: {user_id}")
            return False
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise
    
    @staticmethod
    async def deactivate_user(
        db: AsyncSession,
        user_id: str
    ) -> bool:
        """
        Deactivate a user (soft delete)
        Replaces: supabase_admin.auth.admin.update_user_by_id() with ban
        """
        try:
            # Update user in auth.users
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user:
                # Ban user for 100 years (effectively permanent)
                user.banned_until = datetime.utcnow() + timedelta(days=36500)
                user.updated_at = datetime.utcnow()
                
                # Also update profile status
                stmt = select(Profile).where(Profile.id == user_id)
                result = await db.execute(stmt)
                profile = result.scalar_one_or_none()
                
                if profile:
                    profile.status = "inactive"
                    profile.updated_at = datetime.utcnow()
                
                await db.commit()
                logger.info(f"Deactivated user: {user_id}")
                return True
            
            logger.warning(f"User not found for deactivation: {user_id}")
            return False
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deactivating user: {str(e)}")
            raise
    
    @staticmethod
    async def update_password(
        db: AsyncSession,
        user_id: str,
        new_password: str
    ) -> bool:
        """Update user password"""
        try:
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user:
                user.encrypted_password = AuthService.hash_password(new_password)
                user.updated_at = datetime.utcnow()
                await db.commit()
                logger.info(f"Updated password for user: {user_id}")
                return True
            
            return False
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating password: {str(e)}")
            raise
    
    @staticmethod
    async def create_password_reset_token(
        db: AsyncSession,
        email: str
    ) -> Optional[str]:
        """Create a password reset token"""
        try:
            # Check if user exists
            stmt = select(User).where(User.email == email)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                # Don't reveal if email exists
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return None
            
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            
            # Store token in user record with expiry
            user.recovery_token = reset_token
            user.recovery_sent_at = datetime.utcnow()
            await db.commit()
            
            logger.info(f"Created password reset token for user: {user.id}")
            return reset_token
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating password reset token: {str(e)}")
            return None
    
    @staticmethod
    async def verify_password_reset_token(
        db: AsyncSession,
        email: str,
        token: str
    ) -> Optional[User]:
        """Verify password reset token (1 hour expiry)"""
        try:
            stmt = select(User).where(User.email == email)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user or not user.recovery_token:
                logger.warning(f"Invalid password reset token for: {email}")
                return None
            
            # Check token match
            if user.recovery_token != token:
                logger.warning(f"Password reset token mismatch for: {email}")
                return None
            
            # Check expiry (1 hour)
            if user.recovery_sent_at:
                expiry = user.recovery_sent_at + timedelta(hours=1)
                if datetime.utcnow() > expiry:
                    logger.warning(f"Password reset token expired for: {email}")
                    return None
            
            return user
            
        except Exception as e:
            logger.error(f"Error verifying password reset token: {str(e)}")
            return None
    
    @staticmethod
    async def reset_password_with_token(
        db: AsyncSession,
        email: str,
        token: str,
        new_password: str
    ) -> bool:
        """Reset password using token"""
        try:
            user = await AuthService.verify_password_reset_token(db, email, token)
            
            if not user:
                return False
            
            # Update password
            user.encrypted_password = AuthService.hash_password(new_password)
            user.recovery_token = None
            user.recovery_sent_at = None
            user.updated_at = datetime.utcnow()
            
            await db.commit()
            logger.info(f"Password reset successful for user: {user.id}")
            return True
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error resetting password: {str(e)}")
            return False
    
    @staticmethod
    async def get_user_with_roles(
        db: AsyncSession,
        user_id: str,
        company_reg_no: Optional[str] = None
    ) -> Optional[dict]:
        """Get user with roles and profile"""
        try:
            # Get user from auth.users
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user or not user.is_active:
                return None
            
            # Get profile from public.profiles
            stmt = select(Profile).where(Profile.id == str(user_id))
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()
            
            if not profile:
                return None
            
            # Get roles
            stmt = (
                select(Role.name)
                .join(UserRole, UserRole.role_id == Role.id)
                .where(UserRole.user_id == str(user_id))
            )
            
            if company_reg_no:
                stmt = stmt.where(UserRole.company_reg_no == company_reg_no)
            
            result = await db.execute(stmt)
            roles = [row[0] for row in result.fetchall()]
            
            return {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "is_active": user.is_active,
                    "email_confirmed": user.email_confirmed
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
                    "status": profile.status
                },
                "roles": roles,
                "company_reg_no": profile.company_reg_no
            }
            
        except Exception as e:
            logger.error(f"Error getting user with roles: {str(e)}")
            return None


async def get_current_user(token: str, db: AsyncSession) -> dict:
    """Dependency to get current user from JWT token"""
    try:
        payload = AuthService.decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise ValueError("Invalid token payload")
        
        user_data = await AuthService.get_user_with_roles(db, user_id)
        
        if not user_data:
            raise ValueError("User not found")
        
        return user_data
        
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise ValueError("Could not validate credentials")
