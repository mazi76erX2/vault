from fastapi import HTTPException, Request, status
from gotrue import UserResponse

from app.database import supabase


def _extract_bearer_token(request: Request) -> str:
    auth = request.headers.get("Authorization") or request.headers.get("authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
        )
    return auth.split("Bearer ", 1)[1].strip()


def verifytoken(request: Request) -> UserResponse:
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
