from fastapi import HTTPException, Request, status
from gotrue import UserResponse

from app.database import supabase


def _extract_bearer_token(request: Request) -> str:
    """Extract JWT token from Authorization header."""
    auth = request.headers.get("Authorization") or request.headers.get("authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
        )
    return auth.split("Bearer ", 1)[1].strip()


def verify_token(request: Request) -> UserResponse:
    """
    Verify JWT token and return user information.

    Args:
        request: FastAPI request object

    Returns:
        UserResponse object with user information

    Raises:
        HTTPException: If token is invalid or verification fails
    """
    token = _extract_bearer_token(request)
    try:
        user: UserResponse = supabase.auth.get_user(token)
        if not user or not getattr(user, "user", None) or not getattr(user.user, "id", None):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: invalid token",
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )


def verify_token_with_tenant(request: Request, company_id: str | None = None) -> UserResponse:
    """
    Verify JWT token and optionally check tenant/company association.

    This function provides multi-tenant isolation by verifying that the authenticated
    user belongs to the specified company.

    Args:
        request: FastAPI request object
        company_id: Optional company ID to verify user belongs to this tenant

    Returns:
        UserResponse object with user information

    Raises:
        HTTPException: If token is invalid, verification fails, or user doesn't belong to company
    """
    # First verify the token
    user = verify_token(request)

    # If company_id is provided, verify user belongs to that company
    if company_id:
        try:
            user_id = user.user.id

            # Query user's profile to get their company_id
            response = (
                supabase.table("profiles")
                .select("company_id, company_name")
                .eq("id", user_id)
                .single()
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found",
                )

            user_company_id = str(response.data.get("company_id"))

            # Check if user belongs to the requested company
            if user_company_id != str(company_id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied: User does not belong to company {company_id}",
                )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error verifying tenant access: {str(e)}",
            )

    return user


def get_user_company_id(user: UserResponse) -> str | None:
    """
    Get the company_id for a given user.

    Args:
        user: UserResponse object

    Returns:
        Company ID as string, or None if not found
    """
    try:
        user_id = user.user.id

        response = (
            supabase.table("profiles").select("company_id").eq("id", user_id).single().execute()
        )

        if response.data and response.data.get("company_id"):
            return str(response.data["company_id"])

        return None

    except Exception as e:
        print(f"Error getting user company_id: {str(e)}")
        return None


# Export all functions
__all__ = [
    "verify_token",
    "verify_token_with_tenant",
    "get_user_company_id",
]
