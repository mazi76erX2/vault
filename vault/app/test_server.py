import logging

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.database import supabase

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:8081",  # Vite default port
    "http://localhost:3000",  # Common React port
    "http://81.28.6.125:8000",
    "http://localhost:8082",
    "https://vaulttesting.highcoordination.de",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600,
)


@app.get("/api/users/departments")
def get_departments():
    """
    Endpoint to get departments enumerated type from supabase.
    """
    logger.info("Getting departments from supabase")
    try:
        departments_response = supabase.rpc(
            "get_enum_values", {"enum_name": "department"}
        ).execute()
        departments_data = departments_response.data
        logger.info("departments: %s", departments_data)
        return departments_data
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching departments: {str(e)}")


@app.get("/api/admin/users")
def admin_get_users():
    """
    Simplified admin_get_users endpoint that returns the basic user data.
    """
    try:
        logger.info("admin_get_users endpoint called")

        # Fetch profiles with selected columns
        profiles_response = (
            supabase.table("profiles")
            .select(
                "id, full_name, username, email, telephone, company_name, company_id, "
                "department, field_of_expertise, years_of_experience, user_type, isValidator, user_access"
            )
            .order("updated_at", desc=True)
            .execute()
        )

        if not profiles_response.data:
            return []

        profiles_data = profiles_response.data

        # Add security_level field for frontend compatibility
        for profile in profiles_data:
            profile["security_level"] = profile.get("user_access")

        return profiles_data

    except Exception as e:
        logger.error(f"Error in admin_get_users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
