
import jwt
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..models import Profile


async def get_current_user_company(
    request: Request,
    db: AsyncSession
) -> str | None:
    """
    Extract company_reg_no from the current authenticated user.
    This mimics Supabase RLS by filtering queries based on tenant.
    """
    # Extract JWT token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")

    try:
        # Decode JWT to get user_id
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")

        if not user_id:
            return None

        # Get user's company_reg_no from profile
        stmt = select(Profile.company_reg_no).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_reg_no = result.scalar_one_or_none()

        return company_reg_no
    except Exception:
        return None

class TenantFilter:
    """
    Utility class to add tenant filtering to queries.
    Use this to ensure multi-tenancy isolation at the application level.
    """

    def __init__(self, company_reg_no: str):
        self.company_reg_no = company_reg_no

    def filter_query(self, model, query):
        """Add company_reg_no filter to query if model has the field"""
        if hasattr(model, 'company_reg_no'):
            return query.where(model.company_reg_no == self.company_reg_no)
        return query
