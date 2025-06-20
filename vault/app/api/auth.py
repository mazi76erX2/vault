# auth.py
from fastapi import FastAPI, HTTPException, Request, APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.database import supabase
from app.dto.auth import LoginRequest, LoginResponse, User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class RefreshTokenRequest(BaseModel):
    refreshToken: str


# Define a response model for refresh, similar to LoginResponse
# but refreshToken might be optional if not always rotated
class RefreshTokenResponse(BaseModel):
    user: User
    token: str
    refreshToken: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )

        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Try to get user profile data
        try:
            profile_response = (
                supabase.table("profiles")
                .select("*")
                .eq("id", response.user.id)
                .execute()
            )
            profile_data = profile_response.data[0] if profile_response.data else None
        except Exception as e:
            print(f"Error fetching profile data: {e}")
            profile_data = None

        # Get user data from profile or auth user
        user_data = {
            "id": response.user.id,
            "email": (
                profile_data.get("email")
                if profile_data and profile_data.get("email")
                else response.user.email
            ),
            "username": (
                profile_data.get("username")
                if profile_data and profile_data.get("username")
                else response.user.email
            ),
        }

        # Handle full name from profile
        if profile_data and profile_data.get("full_name"):
            name_parts = profile_data["full_name"].split(" ", 1)
            user_data["firstname"] = name_parts[0]
            user_data["lastname"] = name_parts[1] if len(name_parts) > 1 else ""
        else:
            user_data["firstname"] = ""
            user_data["lastname"] = ""

        return LoginResponse(
            user=User(**user_data),
            token=response.session.access_token,
            refreshToken=response.session.refresh_token,
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        error_message = str(e)
        if "SSL" in error_message:
            error_message = (
                "Failed to connect to authentication service. Please try again."
            )
        raise HTTPException(status_code=500, detail=error_message)


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    try:
        # Attempt to refresh the session using the refresh token
        # The Supabase client library might handle this differently based on version.
        # Common methods include refresh_session or set_session then get_session.
        # Assuming refresh_user_session or similar if available,
        # or set_session then get_user to retrieve new tokens.

        # Option 1: Using a dedicated refresh method (preferred if available)
        # response = supabase.auth.refresh_session(request.refreshToken)

        # Option 2: Setting the session and then getting user/session (more common with older gotrue-py)
        # This might automatically refresh if the access token is expired.
        # If supabase.auth.set_session and then supabase.auth.get_session() is the way:
        # supabase.auth.set_session(access_token="dummy_expired_token_if_needed", refresh_token=request.refreshToken)
        # refreshed_session_response = supabase.auth.get_session()

        # For gotrue-py, set_session followed by get_user is a common pattern
        # to force a refresh if the access token it holds is expired.
        # However, refresh_session is the more direct approach if available.
        # Let's assume a direct refresh mechanism or that get_user after set_session works for refresh.

        # The most robust way with gotrue-py is usually to try to get the user with the refresh token set.
        # If the library supports it, it handles the refresh internally.
        # If not, you might need to directly call a refresh_token function if the supabase client exposes it.

        # Given Supabase typically handles JWTs, the refresh token is used to get a new session.
        refreshed_session_response = supabase.auth.refresh_session(request.refreshToken)

        if (
            not refreshed_session_response
            or not refreshed_session_response.session
            or not refreshed_session_response.user
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token or failed to refresh session",
            )

        session = refreshed_session_response.session
        user_info = refreshed_session_response.user

        return RefreshTokenResponse(
            user=User(
                id=user_info.id,
                username=user_info.email,  # or other username field if available
                email=user_info.email,
                firstname=user_info.user_metadata.get("firstname", ""),
                lastname=user_info.user_metadata.get("lastname", ""),
            ),
            token=session.access_token,
            refreshToken=session.refresh_token,  # Supabase usually provides a new refresh token
        )
    except HTTPException as e:  # Re-raise HTTPExceptions
        raise e
    except Exception as e:
        # Log the exception e for more details
        print(f"Refresh token error: {e}")  # Temporary print for debugging
        raise HTTPException(
            status_code=401, detail=f"Could not refresh token: {str(e)}"
        )


@router.post("/logout")
async def logout(request: Request):
    # Extract the Bearer token from the Authorization header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Authorization header missing or invalid"
        )

    token = authorization.split(" ")[1]

    try:
        # Call Supabase to invalidate/expire the session
        response = supabase.auth.sign_out(token=token)

    except Exception as e:
        raise HTTPException(status_code=400, detail=e)

    return {"detail": "Logout successful"}


class RolesResponse(BaseModel):
    roles: List[str]


@router.get("/user_roles/{user_id}", response_model=RolesResponse)
async def get_user_roles(user_id: str):
    """
    Fetch the roles associated with a given user_id from the user_roles and roles tables.
    """
    # Query user_roles to get role_ids
    user_roles_resp = (
        supabase.table("user_roles").select("role_id").eq("user_id", user_id).execute()
    )
    role_ids = [r.get("role_id") for r in (user_roles_resp.data or [])]
    # Query roles table to get role names
    roles_resp = supabase.table("roles").select("name").in_("id", role_ids).execute()
    role_names = [r.get("name") for r in (roles_resp.data or [])]
    return RolesResponse(roles=role_names)
