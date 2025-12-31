import logging
from typing import Any

from fastapi import HTTPException, status

from app.database import supabase

logger = logging.getLogger(__name__)


class TenantService:
    """Service for tenant-aware database operations."""

    @staticmethod
    def get_tenant_profiles(company_reg_no: str) -> list[dict[str, Any]]:
        """Get all profiles for a specific tenant."""
        try:
            response = (
                supabase.table("profiles")
                .select("*")
                .eq("company_reg_no", company_reg_no)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching tenant profiles for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching tenant profiles",
            )

    @staticmethod
    def get_tenant_profile(user_id: str, company_reg_no: str) -> dict[str, Any] | None:
        """Get a specific profile ensuring it belongs to the tenant."""
        try:
            response = (
                supabase.table("profiles")
                .select("*")
                .eq("id", user_id)
                .eq("company_reg_no", company_reg_no)
                .single()
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error fetching tenant profile {user_id} for {company_reg_no}: {e}")
            return None

    @staticmethod
    def get_tenant_documents(company_reg_no: str) -> list[dict[str, Any]]:
        """Get all documents for a specific tenant."""
        try:
            response = (
                supabase.table("documents")
                .select("*")
                .eq("company_reg_no", company_reg_no)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching tenant documents for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching tenant documents",
            )

    @staticmethod
    def get_tenant_user_roles(company_reg_no: str) -> list[dict[str, Any]]:
        """Get all user roles for a specific tenant."""
        try:
            response = (
                supabase.table("user_roles")
                .select("*, profiles!inner(full_name, email), roles!inner(name)")
                .eq("company_reg_no", company_reg_no)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching tenant user roles for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching tenant user roles",
            )

    @staticmethod
    def get_tenant_sessions(company_reg_no: str) -> list[dict[str, Any]]:
        """Get all sessions for a specific tenant."""
        try:
            response = (
                supabase.table("sessions")
                .select("*, profiles!inner(full_name, email)")
                .eq("company_reg_no", company_reg_no)
                .execute()
            )
            return response.data or []
        except Exception as e:
            logger.error(f"Error fetching tenant sessions for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error fetching tenant sessions",
            )

    @staticmethod
    def create_tenant_profile(profile_data: dict[str, Any], company_reg_no: str) -> dict[str, Any]:
        """Create a new profile for a specific tenant."""
        try:
            # Ensure the company_reg_no is set
            profile_data["company_reg_no"] = company_reg_no

            response = supabase.table("profiles").insert(profile_data).execute()

            if response.data:
                return response.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create profile",
                )
        except Exception as e:
            logger.error(f"Error creating tenant profile for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating tenant profile",
            )

    @staticmethod
    def update_tenant_profile(
        user_id: str, profile_data: dict[str, Any], company_reg_no: str
    ) -> dict[str, Any]:
        """Update a profile ensuring it belongs to the tenant."""
        try:
            # Remove company_reg_no from update data to prevent modification
            profile_data.pop("company_reg_no", None)

            response = (
                supabase.table("profiles")
                .update(profile_data)
                .eq("id", user_id)
                .eq("company_reg_no", company_reg_no)
                .execute()
            )

            if response.data:
                return response.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found or access denied",
                )
        except Exception as e:
            logger.error(f"Error updating tenant profile {user_id} for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating tenant profile",
            )

    @staticmethod
    def delete_tenant_profile(user_id: str, company_reg_no: str) -> bool:
        """Delete a profile ensuring it belongs to the tenant."""
        try:
            response = (
                supabase.table("profiles")
                .delete()
                .eq("id", user_id)
                .eq("company_reg_no", company_reg_no)
                .execute()
            )

            return len(response.data or []) > 0
        except Exception as e:
            logger.error(f"Error deleting tenant profile {user_id} for {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting tenant profile",
            )

    @staticmethod
    def assign_tenant_user_role(user_id: str, role_id: str, company_reg_no: str) -> dict[str, Any]:
        """Assign a role to a user within a tenant."""
        try:
            # First verify the user belongs to the tenant
            profile = TenantService.get_tenant_profile(user_id, company_reg_no)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found in tenant",
                )

            role_data = {
                "user_id": user_id,
                "role_id": role_id,
                "company_reg_no": company_reg_no,
            }

            response = supabase.table("user_roles").insert(role_data).execute()

            if response.data:
                return response.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to assign role",
                )
        except Exception as e:
            logger.error(f"Error assigning role for user {user_id} in tenant {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error assigning tenant user role",
            )

    @staticmethod
    def remove_tenant_user_role(user_id: str, role_id: str, company_reg_no: str) -> bool:
        """Remove a role from a user within a tenant."""
        try:
            response = (
                supabase.table("user_roles")
                .delete()
                .eq("user_id", user_id)
                .eq("role_id", role_id)
                .eq("company_reg_no", company_reg_no)
                .execute()
            )

            return len(response.data or []) > 0
        except Exception as e:
            logger.error(f"Error removing role for user {user_id} in tenant {company_reg_no}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error removing tenant user role",
            )
