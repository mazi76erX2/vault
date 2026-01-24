"""
Admin endpoints for user management.
"""

import logging
import random
import string
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.features.email.email_service import send_welcome_email
from app.middleware.auth import verify_token_with_tenant
from app.models import Profile, Role, Session, User, UserRole
from app.schemas.user import (
    DeleteUserResponse,
    OrganisationDetails,
    UpdateUserDetailsRequest,
)
from app.services.auth_service import AuthService
from app.services.tenant_service import TenantService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/users")
async def admin_get_users(
    current_user: dict = Depends(verify_token_with_tenant), db: AsyncSession = Depends(get_async_db)
):
    """Get all users for tenant (admin only)."""
    try:
        logger.info("admin_get_users endpoint called with tenant-aware authentication")

        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        # Get all profiles for this tenant
        profiles = await TenantService.get_tenant_profiles(db, company_reg_no)

        if not profiles:
            return []

        user_ids = [str(profile["id"]) for profile in profiles]

        # Get all roles
        stmt = select(Role.id, Role.name)
        result = await db.execute(stmt)
        roles = result.all()
        role_name_to_id = {role.name: str(role.id) for role in roles}

        # Get user roles for this tenant
        stmt = select(UserRole.user_id, UserRole.role_id).where(
            UserRole.user_id.in_(user_ids), UserRole.company_reg_no == company_reg_no
        )
        result = await db.execute(stmt)
        user_role_rows = result.all()

        user_roles_map = {}
        for row in user_role_rows:
            user_id = str(row.user_id)
            if user_id not in user_roles_map:
                user_roles_map[user_id] = []
            user_roles_map[user_id].append(str(row.role_id))

        # Augment profiles with role booleans
        augmented_users = []
        for profile in profiles:
            user_id = str(profile["id"])
            assigned_role_ids = user_roles_map.get(user_id, [])

            profile["is_admin"] = role_name_to_id.get("Administrator") in assigned_role_ids
            profile["is_validator"] = profile.get("is_validator", False) or (
                role_name_to_id.get("Validator") in assigned_role_ids
            )
            profile["is_expert"] = role_name_to_id.get("Expert") in assigned_role_ids
            profile["is_collector"] = role_name_to_id.get("Collector") in assigned_role_ids
            profile["is_helper"] = role_name_to_id.get("Helper") in assigned_role_ids
            profile["registered_since"] = profile.get("created_at")
            profile["security_level"] = profile.get("user_access")

            augmented_users.append(profile)

        logger.info(f"Returning {len(augmented_users)} users for tenant {company_reg_no}")
        return augmented_users

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in admin_get_users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}") from e


@router.post("/users/update", response_model=OrganisationDetails)
async def update_user_details(
    request: UpdateUserDetailsRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Update or add user details (Administrator only)."""
    try:
        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        # Admin check using SQLAlchemy
        current_user_id = current_user.get("user_id")
        stmt = (
            select(UserRole.role_id)
            .join(Role)
            .where(
                UserRole.user_id == current_user_id,
                UserRole.company_reg_no == company_reg_no,
                Role.name == "Administrator",
            )
        )
        result = await db.execute(stmt)
        is_admin = result.scalar_one_or_none() is not None

        if not is_admin:
            logger.warning(
                f"User {current_user_id} attempted to access admin endpoint "
                f"without Administrator role in tenant {company_reg_no}."
            )
            raise HTTPException(
                status_code=403,
                detail="User does not have permission to perform this action. Administrator role required.",
            )

        current_date = datetime.utcnow()
        first_name = request.firstName
        last_name = request.lastName
        requested_company_name = request.company
        user_id_from_request = request.user_id
        email = request.email
        telephone = request.telephone
        requested_username = request.username
        requested_roles = request.roles

        logger.info(
            f"Processing user update/creation for tenant {company_reg_no}. "
            f"Company name: '{requested_company_name}'."
        )

        db_user_id = None
        is_existing_profile = False

        if user_id_from_request:
            # Check if profile exists within this tenant
            existing_profile = await TenantService.get_tenant_profile(
                db, user_id_from_request, company_reg_no
            )
            if existing_profile:
                is_existing_profile = True
                db_user_id = existing_profile["id"]

                # Check email uniqueness
                if email != existing_profile["email"]:
                    tenant_profiles = await TenantService.get_tenant_profiles(db, company_reg_no)
                    for profile in tenant_profiles:
                        if profile["email"] == email and profile["id"] != db_user_id:
                            raise HTTPException(
                                status_code=400,
                                detail=f"Email '{email}' is already in use by another user in your organization.",
                            )

                # Check username uniqueness
                if requested_username and requested_username != existing_profile.get("username"):
                    tenant_profiles = await TenantService.get_tenant_profiles(db, company_reg_no)
                    for profile in tenant_profiles:
                        if (
                            profile.get("username") == requested_username
                            and profile["id"] != db_user_id
                        ):
                            raise HTTPException(
                                status_code=400,
                                detail=f"Username '{requested_username}' is already taken in your organization.",
                            )
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"User with ID '{user_id_from_request}' not found in your organization.",
                )
        else:
            # Check if email exists within tenant
            tenant_profiles = await TenantService.get_tenant_profiles(db, company_reg_no)
            for profile in tenant_profiles:
                if profile["email"] == email:
                    is_existing_profile = True
                    db_user_id = profile["id"]

                    if requested_username and requested_username != profile.get("username"):
                        for other_profile in tenant_profiles:
                            if (
                                other_profile.get("username") == requested_username
                                and other_profile["id"] != db_user_id
                            ):
                                raise HTTPException(
                                    status_code=400,
                                    detail=f"Username '{requested_username}' is already taken in your organization.",
                                )
                    break

            if not is_existing_profile:
                # Generate username if not provided
                if requested_username:
                    for profile in tenant_profiles:
                        if profile.get("username") == requested_username:
                            raise HTTPException(
                                status_code=400,
                                detail=f"Username '{requested_username}' is already taken in your organization.",
                            )
                else:
                    base_username = f"{first_name.lower().replace(' ', '')}_{last_name.lower().replace(' ', '')}{random.randint(100, 999)}"
                    requested_username = base_username
                    while any(
                        profile.get("username") == requested_username for profile in tenant_profiles
                    ):
                        requested_username = f"{first_name.lower().replace(' ', '')}_{last_name.lower().replace(' ', '')}{random.randint(100, 999)}"

        profile_data_to_update = {
            "full_name": f"{first_name} {last_name}",
            "email": email,
            "telephone": telephone,
            "company_name": requested_company_name,
            "company_reg_no": company_reg_no,
            "updated_at": current_date,
        }
        if requested_username:
            profile_data_to_update["username"] = requested_username

        # Validate required fields
        required_fields_check = {
            "email": profile_data_to_update["email"],
            "full_name": profile_data_to_update["full_name"],
            "telephone": profile_data_to_update["telephone"],
            "company_name": profile_data_to_update["company_name"],
        }
        missing_fields = [
            field_name for field_name, value in required_fields_check.items() if not value
        ]
        if missing_fields:
            formatted_fields = [field.replace("_", " ") for field in missing_fields]
            missing_fields_str = ", ".join(formatted_fields)
            raise HTTPException(
                status_code=400,
                detail=f"The following fields are required for profile: {missing_fields_str}",
            )

        if is_existing_profile:
            if not db_user_id:
                raise HTTPException(
                    status_code=500,
                    detail="User ID missing for existing profile update.",
                )
            await TenantService.update_tenant_profile(
                db, db_user_id, profile_data_to_update, company_reg_no
            )
            logger.info(f"Profile updated for user ID: {db_user_id} in tenant {company_reg_no}")
        else:
            # Create new user
            password = "".join(random.choices(string.ascii_letters + string.digits, k=12))
            if not profile_data_to_update.get("username"):
                profile_data_to_update["username"] = requested_username

            try:
                # Create user using AuthService
                new_user = await AuthService.create_user(
                    db=db,
                    email=email,
                    password=password,
                    full_name=profile_data_to_update["full_name"],
                )
                db_user_id = str(new_user.id)
                profile_data_to_update["id"] = db_user_id

                # Create profile
                await TenantService.create_tenant_profile(
                    db, profile_data_to_update, company_reg_no
                )
                logger.info(
                    f"Profile created for new user ID: {db_user_id} in tenant {company_reg_no}"
                )

                # Send welcome email
                username_for_email = profile_data_to_update.get("username")
                if not username_for_email:
                    logger.error(f"Username is unexpectedly None for new user {db_user_id}")
                    username_for_email = "User"

                await send_welcome_email(email, password, username_for_email)
            except Exception as e:
                await db.rollback()
                logger.error(f"Error creating user account: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Error creating user account: {str(e)}"
                ) from e

        # Handle roles (tenant-scoped)
        if db_user_id and requested_roles is not None:
            role_ids_to_assign = []
            if requested_roles:
                stmt = select(Role.id, Role.name).where(Role.name.in_(requested_roles))
                result = await db.execute(stmt)
                roles_from_db = result.all()

                role_map = {role.name: str(role.id) for role in roles_from_db}
                for role_name in requested_roles:
                    if role_name in role_map:
                        role_ids_to_assign.append(role_map[role_name])
                    else:
                        logger.warning(f"Role name '{role_name}' not found in database. Skipping.")

            # Clear existing roles
            stmt = select(UserRole).where(
                UserRole.user_id == db_user_id, UserRole.company_reg_no == company_reg_no
            )
            result = await db.execute(stmt)
            existing_roles = result.scalars().all()

            for role in existing_roles:
                await db.delete(role)

            logger.info(
                f"Cleared existing roles for user ID: {db_user_id} in tenant {company_reg_no}"
            )

            # Assign new roles
            if role_ids_to_assign:
                for role_id in role_ids_to_assign:
                    user_role = UserRole(
                        user_id=db_user_id,
                        role_id=role_id,
                        company_reg_no=company_reg_no,
                    )
                    db.add(user_role)

                await db.commit()
                logger.info(
                    f"Assigned new roles to user ID: {db_user_id} in tenant {company_reg_no} - Roles: {requested_roles}"
                )

        response_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "telephone": telephone,
            "company": requested_company_name,
            "registeredSince": current_date.isoformat(),
            "user_id": db_user_id,
        }
        return OrganisationDetails(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating organisation details: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error updating organisation details: {str(e)}"
        ) from e


@router.delete("/users/{user_id}", status_code=200, response_model=DeleteUserResponse)
async def admin_users_delete(user_id: str, db: AsyncSession = Depends(get_async_db)):
    """Delete a user from the system."""
    try:
        # Check if user has sessions
        stmt = select(Session.id).where(Session.user_id == user_id).limit(1)
        result = await db.execute(stmt)
        has_session = result.scalar_one_or_none() is not None

        if not has_session:
            # Hard delete
            stmt = select(User).where(User.id == user_id)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()

            if user:
                await db.delete(user)
                await db.commit()
                logger.info(f"Deleted user {user_id}")

            stmt = select(Profile).where(Profile.id == user_id)
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()

            if profile:
                await db.delete(profile)
                await db.commit()
                logger.info(f"Deleted profile {user_id}")

            return DeleteUserResponse(message=f"User {user_id} permanently deleted.")

        # Soft delete
        stmt = select(Profile).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            logger.warning(f"Profile not found for {user_id}")
            return DeleteUserResponse(message=f"User {user_id} was not found, considered deleted.")

        # Update user status
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            user.email_confirmed_at = None
            user.banned_until = None

        # Update profile status
        profile.status = "inactive"
        profile.updated_at = datetime.utcnow()

        await db.commit()
        logger.info(f"Deactivated user {user_id}")

        return DeleteUserResponse(message=f"User {user_id} successfully deactivated.")

    except HTTPException:
        raise
    except Exception as err:
        await db.rollback()
        logger.error(f"Unexpected error for {user_id}: {err}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {err}") from err
