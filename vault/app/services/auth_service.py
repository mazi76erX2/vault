from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from app.database import supabase
from typing import List, Dict, Any
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)
security = HTTPBearer()


# Create a Pydantic model for the user with roles
class UserWithRoles(BaseModel):
    id: str
    email: str
    roles: List[str]
    # Add other user fields as needed

    class Config:
        arbitrary_types_allowed = True


async def get_current_user(token: str = Depends(security)):
    try:
        response = supabase.auth.get_user(token.credentials)

        if not response or not response.user:
            logger.error("No user found for provided token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get the user ID from the authenticated user
        user_id = response.user.id
        logger.info(f"User authenticated with ID: {user_id}")

        # Fetch user roles from the database
        try:
            user_roles_resp = (
                supabase.table("user_roles")
                .select("role_id")
                .eq("user_id", user_id)
                .execute()
            )

            role_ids = [r.get("role_id") for r in (user_roles_resp.data or [])]

            # Query roles table to get role names
            if role_ids:
                roles_resp = (
                    supabase.table("roles").select("name").in_("id", role_ids).execute()
                )
                role_names = [r.get("name") for r in (roles_resp.data or [])]
            else:
                role_names = []

            logger.info(f"User {user_id} has roles: {role_names}")

            # Create a new user object with roles
            user_dict = {
                "id": user_id,
                "email": response.user.email,
                "roles": role_names,
            }

            user_with_roles = (
                user_dict  # Return as a dictionary instead of trying to use a model
            )

            return user_with_roles

        except Exception as e:
            logger.error(f"Error fetching user roles: {str(e)}")
            # If we can't get roles but user is authenticated, return user with empty roles
            return {"id": user_id, "email": response.user.email, "roles": []}

    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def supabase_signup(email: str, password: str):
    return supabase.auth.sign_up(
        {
            "email": email,
            "password": password,
        }
    )


def supabase_login(email: str, password: str):
    return supabase.auth.sign_in_with_password({"email": email, "password": password})


def require_roles(roles: List[str]):
    """
    Decorator to check if the current user has the required roles.
    """

    def role_checker(current_user=Depends(get_current_user)):
        logger.info(f"Checking roles for user: {current_user.get('id', 'unknown')}")

        user_roles = current_user.get("roles", [])

        user_roles_norm = [
            r.lower().strip() if isinstance(r, str) else "" for r in user_roles
        ]
        required_roles_norm = [
            r.lower().strip() if isinstance(r, str) else "" for r in roles
        ]

        if any(r in user_roles for r in roles):
            logger.info(
                f"Role check passed (exact match) for user {current_user.get('id', 'unknown')}"
            )
            return current_user

        if any(
            ur in required_roles_norm for ur in user_roles_norm
        ):  # This is the normalized check
            logger.info(
                f"Role check passed (case-insensitive) for user {current_user.get('id', 'unknown')}"
            )
            return current_user

        logger.warning(
            f"User with roles {user_roles} tried to access a resource requiring {roles}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges"
        )

    return role_checker
