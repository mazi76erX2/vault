from app.database import supabase
from fastapi import Request, HTTPException, status
import logging
from gotrue.types import UserResponse

logger = logging.getLogger(__name__)


class TenantAwareUser:
    """Wrapper class that adds tenant context to a UserResponse object."""

    def __init__(self, user_response: UserResponse, company_reg_no: str):
        self.user_response = user_response
        self.company_reg_no = company_reg_no

    @property
    def user(self):
        """Delegate user property access to the wrapped UserResponse."""
        return self.user_response.user

    def __getattr__(self, name):
        """Delegate attribute access to the wrapped UserResponse, but check our own attributes first."""
        # First check if it's one of our own attributes
        if name == "company_reg_no":
            return self.company_reg_no
        # Otherwise delegate to the wrapped UserResponse
        return getattr(self.user_response, name)


def verify_token(request: Request):
    # Get the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token"
        )

    token = auth_header.split("Bearer ")[1]

    # Decode and verify the token using Supabase
    try:
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Invalid token",
            )
        return user  # Return the authenticated user data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed: " + str(e),
        )


def get_user_company_reg_no(user_id: str) -> str:
    """Get the company registration number for a user."""
    try:
        # Use the database function we created
        response = supabase.rpc(
            "get_company_reg_no_from_user_id", {"user_id": user_id}
        ).execute()

        if response.data:
            return response.data
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User company association not found",
            )
    except Exception as e:
        logger.error(f"Error getting company reg no for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user company information",
        )


def validate_tenant_access(user_id: str, required_company_reg_no: str) -> bool:
    """Validate that a user belongs to the required company."""
    try:
        # Use the database function we created
        response = supabase.rpc(
            "user_belongs_to_company",
            {"user_id": user_id, "reg_no": required_company_reg_no},
        ).execute()

        return response.data if response.data is not None else False
    except Exception as e:
        logger.error(f"Error validating tenant access for user {user_id}: {e}")
        return False


def verify_token_with_tenant(request: Request):
    """
    Enhanced token verification that adds tenant context to the user object.
    """
    try:
        import time

        current_time = time.time()
        logging.info(
            f"[UPDATED-{current_time}] Starting token verification with tenant context"
        )

        # First verify the token using the existing function
        user = verify_token(request)
        logging.info(f"Token verified successfully, user type: {type(user)}")
        logging.info(f"User object: {user}")

        # Get the user's company registration number
        user_id = user.user.id
        logging.info(f"Extracted user ID: {user_id}")

        company_reg_no = get_user_company_reg_no(user_id)
        logging.info(f"Retrieved company reg no: {company_reg_no}")

        # Create a tenant-aware user wrapper
        tenant_user = TenantAwareUser(user, company_reg_no)
        logging.info(f"Created tenant-aware user wrapper")

        return tenant_user

    except HTTPException as http_e:
        # Re-raise HTTPExceptions from get_user_company_reg_no as-is
        logging.error(f"HTTPException in verify_token_with_tenant: {http_e.detail}")
        raise http_e
    except Exception as e:
        logging.error(f"Error in verify_token_with_tenant: {str(e)}")
        logging.error(f"Exception type: {type(e)}")
        import traceback

        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error processing user authentication",
        )
