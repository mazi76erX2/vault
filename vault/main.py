"""
main.py - FastAPI Application Entry Point
Updated for PostgreSQL + SQLAlchemy + pgvector stack
Local-first architecture for knowledge management
Migration to SQLAlchemy: January 2026
"""

import logging
import os
import random
import string
from contextlib import asynccontextmanager
from datetime import datetime

import uvicorn
from fastapi import (APIRouter, Depends, FastAPI, File, HTTPException,
                     UploadFile, WebSocket, WebSocketDisconnect, status)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import and_, delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import router as auth_router
from app.config import settings
from app.connection_manager import connection_manager
from app.connectors.store_data_in_kb import store_in_kb
from app.constants.constants import SEVERITY_LEVEL_MAP
from app.database import Base, async_engine, get_async_db
from app.email_service import send_welcome_email
from app.logger_config import setup_logging
from app.middleware.auth import verify_token, verify_token_with_tenant
from app.models.company import Company
from app.models.document import Document
from app.models.profile import Profile
from app.models.role import Role, UserRole
from app.models.session import Session
from app.schemas.auth import UserCreate
from app.services.auth_service import AuthService

ws_router = APIRouter()

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("🚀 Application startup: Logging system initialized.")
    logger.info(
        f"📊 Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'PostgreSQL'}"
    )

    # Create tables if in debug mode
    if settings.DEBUG:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified")

    yield

    # Shutdown
    logger.info("🛑 Application shutdown: Logging system finalized.")
    await async_engine.dispose()


app = FastAPI(
    title="Vault API",
    description="Knowledge Management System with PostgreSQL + pgvector",
    version="2.0.0",
    lifespan=lifespan,
)

# Include auth router
app.include_router(auth_router)

# TODO: Uncomment after migration
# app.include_router(collector_router)
# app.include_router(helper_router)
# app.include_router(validator_router)
# app.include_router(expert_router)
# app.include_router(ldap_router)


# Role-based access dependency
def require_roles(roles: list[str]):
    """Decorator to check if the current user has the required roles."""

    async def role_checker(
        current_user: dict = Depends(verify_token), db: AsyncSession = Depends(get_async_db)
    ):
        user_id = current_user["user"]["id"]

        # Get user's roles
        stmt = (
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
        )
        result = await db.execute(stmt)
        user_roles = [row[0] for row in result.fetchall()]

        if not any(r in user_roles for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges"
            )
        return current_user

    return role_checker


# CORS
origins = [
    "http://localhost:8081",
    "http://localhost:3000",
    "http://81.28.6.125:8000",
    "http://localhost:8082",
    "https://vaulttesting.highcoordination.de",
    "https://demovault.highcoordination.de",
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

manager = connection_manager()
app.include_router(ws_router)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(client_id, f"You wrote: {data}")
            await manager.broadcast(f"Client {client_id} says: {data}")
    except WebSocketDisconnect:
        await manager.disconnect(client_id, websocket)
        await manager.broadcast(f"Client {client_id} left the chat")


@app.post("/api/console/store_in_kb")
async def store_knowledge(data: dict, db: AsyncSession = Depends(get_async_db)):
    """Store document in knowledge base"""
    document_id = data.get("doc_id")
    logger.info("Received document id: %s", document_id)

    # Get document from database
    stmt = select(Document).where(Document.doc_id == document_id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()

    if not document:
        return {"response": "No document found."}

    # Prepare document for storage
    severity_level_int = SEVERITY_LEVEL_MAP.get(document.severity_levels, 1)
    doc_to_store = {
        "file_name": document.link,
        "content": document.summary,
        "file_title": document.title,
        "level": severity_level_int,
    }

    store_in_kb(doc_to_store)
    response_message = "Document validated and stored in the Knowledge Base"
    logger.info("%s", response_message)

    return {"response": response_message}


# ==================== MISSING ENDPOINTS - Added Below ====================


@app.post("/api/feedback/thumbs_up")
async def thumbs_up(
    data: dict, current_user: dict = Depends(verify_token), db: AsyncSession = Depends(get_async_db)
):
    """Handle thumbs-up feedback"""
    try:
        # TODO: Implement feedback storage in database
        user_id = current_user["user"]["id"]
        feedback_data = {
            "user_id": user_id,
            "feedback_type": "thumbs_up",
            "context": data.get("context"),
            "timestamp": datetime.utcnow(),
        }

        logger.info(f"Thumbs up feedback received from user {user_id}: {feedback_data}")

        return {"status": "success", "message": "Feedback received"}
    except Exception as e:
        logger.error(f"Error processing thumbs up: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing feedback")


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_async_db),
):
    """Upload a document"""
    try:
        user_id = current_user["user"]["id"]

        # Validate file size
        contents = await file.read()
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB",
            )

        # Save file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(contents)

        # Create document record
        new_document = Document(
            title=file.filename,
            link=file_path,
            status="Draft",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_document)
        await db.commit()
        await db.refresh(new_document)

        logger.info(f"Document uploaded: {file.filename} by user {user_id}")

        return {
            "status": "success",
            "doc_id": str(new_document.doc_id),
            "filename": file.filename,
            "size": len(contents),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail="Error uploading document")


@app.get("/api/documents")
async def list_documents(
    current_user: dict = Depends(verify_token), db: AsyncSession = Depends(get_async_db)
):
    """List all documents for current user"""
    try:
        current_user["user"]["id"]
        current_user.get("company_reg_no")

        # Get all documents (add filtering based on your business logic)
        stmt = select(Document).order_by(Document.created_at.desc())
        result = await db.execute(stmt)
        documents = result.scalars().all()

        document_list = []
        for doc in documents:
            document_list.append(
                {
                    "doc_id": str(doc.doc_id),
                    "title": doc.title,
                    "status": doc.status,
                    "severity_levels": doc.severity_levels,
                    "created_at": doc.created_at.isoformat() if doc.created_at else None,
                    "reviewer": doc.reviewer,
                }
            )

        return {"status": "success", "documents": document_list, "count": len(document_list)}

    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching documents")


@app.post("/api/chat/feedback")
async def submit_feedback(
    user_feedback: dict,
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_async_db),
):
    """Submit chat feedback"""
    try:
        user_id = current_user["user"]["id"]

        # TODO: Store feedback in database
        feedback_data = {
            "user_id": user_id,
            "message_id": user_feedback.get("message_id"),
            "rating": user_feedback.get("rating"),
            "comment": user_feedback.get("comment"),
            "timestamp": datetime.utcnow(),
        }

        logger.info(f"Chat feedback received from user {user_id}: {feedback_data}")

        return {"status": "success", "message": "Feedback submitted successfully"}

    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Error submitting feedback")


# ==================== END MISSING ENDPOINTS ====================


@app.get("/download-logs", response_class=FileResponse)
def download_logs():
    """Endpoint to download the backend log file."""
    return FileResponse("backend_logs.log", media_type="text/plain", filename="backend_logs.log")


@app.get("/api/users/departments")
async def get_departments(db: AsyncSession = Depends(get_async_db)):
    """Get departments enumerated type"""
    logger.info("Getting departments from database")

    # Execute raw SQL to get enum values
    result = await db.execute("SELECT unnest(enum_range(NULL::department))::text as value")
    departments = [row[0] for row in result.fetchall()]

    logger.info("departments: %s", departments)
    return departments


# ConsoleMainPage - get validator flag
class UserInfo(BaseModel):
    user_id: str
    is_validator: bool
    is_expert: bool


@app.get("/api/console-main/user-info/{user_id}", response_model=UserInfo)
async def console_main_get_user_info(user_id: str, db: AsyncSession = Depends(get_async_db)):
    """Get user info including validator and expert status"""
    try:
        # Get profile
        stmt = select(Profile.is_validator).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile = result.first()

        is_validator = profile[0] if profile else False

        # Check if user is expert (has documents assigned)
        stmt = select(Document.doc_id).where(Document.reviewer == user_id).limit(1)
        result = await db.execute(stmt)
        is_expert = result.first() is not None

        return UserInfo(user_id=user_id, is_validator=is_validator, is_expert=is_expert)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user info: {str(e)}")


# AdminsPage - get users
@app.get("/api/admin/users")
async def admin_get_users(
    current_user: dict = Depends(verify_token_with_tenant), db: AsyncSession = Depends(get_async_db)
):
    """Get all users for the current tenant"""
    try:
        logger.info("admin_get_users endpoint called with tenant-aware authentication")

        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        logger.info(f"Fetching users for tenant: {company_reg_no}")

        # Get all profiles for this tenant
        stmt = select(Profile).where(Profile.company_reg_no == company_reg_no)
        result = await db.execute(stmt)
        profiles = result.scalars().all()

        if not profiles:
            return []

        user_ids = [profile.id for profile in profiles]

        # Get all roles
        stmt = select(Role)
        result = await db.execute(stmt)
        all_roles = result.scalars().all()
        role_name_to_id_map = {role.name: role.id for role in all_roles}

        # Get user role assignments
        stmt = select(UserRole).where(
            and_(UserRole.user_id.in_(user_ids), UserRole.company_reg_no == company_reg_no)
        )
        result = await db.execute(stmt)
        user_roles_data = result.scalars().all()

        # Build user_roles_assignments map
        user_roles_assignments = {}
        for assignment in user_roles_data:
            if assignment.user_id not in user_roles_assignments:
                user_roles_assignments[assignment.user_id] = []
            user_roles_assignments[assignment.user_id].append(assignment.role_id)

        # Augment profiles with role booleans
        augmented_users = []
        for profile in profiles:
            assigned_role_ids = user_roles_assignments.get(str(profile.id), [])

            user_data = {
                "id": str(profile.id),
                "full_name": profile.full_name,
                "email": profile.email,
                "telephone": profile.telephone,
                "company_name": profile.company_name,
                "is_admin": role_name_to_id_map.get("Administrator") in assigned_role_ids,
                "is_validator": profile.is_validator
                or (role_name_to_id_map.get("Validator") in assigned_role_ids),
                "is_expert": role_name_to_id_map.get("Expert") in assigned_role_ids,
                "is_collector": role_name_to_id_map.get("Collector") in assigned_role_ids,
                "is_helper": role_name_to_id_map.get("Helper") in assigned_role_ids,
                "registered_since": profile.created_at.isoformat() if profile.created_at else None,
                "security_level": profile.user_access,
            }

            augmented_users.append(user_data)

        logger.info(f"Returning {len(augmented_users)} users for tenant {company_reg_no}")
        return augmented_users

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in admin_get_users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@app.post("/api/user/profile")
async def get_user_profile(
    data: dict,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Get user profile"""
    try:
        user_id = data.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        # Get profile
        stmt = select(Profile).where(
            and_(Profile.id == user_id, Profile.company_reg_no == company_reg_no)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        safe_profile_data = {
            "id": str(profile.id),
            "full_name": profile.full_name,
            "email": profile.email,
            "telephone": profile.telephone,
            "company_name": profile.company_name,
        }

        return {"profile": safe_profile_data}
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching user profile: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching user profile: {str(e)}")


# User Company Endpoint
class UserCompanyRequest(BaseModel):
    """Request schema for get_user_company"""

    user_id: str


class CompanyDetails(BaseModel):
    """Response schema for get_user_company"""

    id: str
    name: str
    registered_since: str


class GetUserCompanyResponse(BaseModel):
    """Response schema for get_user_company"""

    company: CompanyDetails


@app.post("/api/user/company", response_model=GetUserCompanyResponse)
async def get_user_company(
    request: UserCompanyRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Get the company details for an admin user."""
    user_id = request.user_id
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        # Get profile
        stmt = select(Profile).where(
            and_(Profile.id == user_id, Profile.company_reg_no == company_reg_no)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User has no associated company or access denied",
            )

        company_id = profile.company_id
        if not company_id:
            raise HTTPException(status_code=404, detail="User has no associated company")

        # Get company
        stmt = select(Company).where(
            and_(Company.id == company_id, Company.company_reg_no == company_reg_no)
        )
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        name = profile.company_name or company.name

        # Update profile if company_name is missing
        if not profile.company_name:
            try:
                profile.company_name = name
                profile.updated_at = datetime.utcnow()
                await db.commit()
                logger.info("Updated profile for user %s with company name %s", user_id, name)
            except Exception as err:
                logger.warning("Failed to update profile for user %s: %s", user_id, err)

        return {
            "company": {
                "id": str(company.id),
                "name": name,
                "registered_since": (
                    company.registered_since.isoformat() if company.registered_since else ""
                ),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching user company: %s", e)
        raise HTTPException(status_code=500, detail="Error fetching user company")


# Organisation Details
class OrganisationDetails(BaseModel):
    """Organisation details model."""

    firstName: str
    lastName: str
    email: str
    telephone: str
    company: str
    registeredSince: str
    user_id: str | None = None


class UpdateUserDetailsRequest(BaseModel):
    """Request schema for update_user_details"""

    firstName: str
    lastName: str
    email: EmailStr
    telephone: str
    company: str
    user_id: str | None = None
    username: str | None = None
    roles: list[str] | None = None


@app.post("/api/user/update_user_details", response_model=OrganisationDetails)
async def update_user_details(
    request: UpdateUserDetailsRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Update or add user details. Only accessible by users with the Administrator role."""
    try:
        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        # Admin check
        current_user_id = current_user["user"]["id"]
        stmt = (
            select(Role.id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                and_(
                    UserRole.user_id == current_user_id,
                    UserRole.company_reg_no == company_reg_no,
                    Role.name == "Administrator",
                )
            )
        )
        result = await db.execute(stmt)
        is_admin = result.first() is not None

        if not is_admin:
            logger.warning(
                f"User {current_user_id} attempted to access admin endpoint without Administrator role in tenant {company_reg_no}."
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

        db_user_id = None
        is_existing_profile = False

        if user_id_from_request:
            # Check if profile exists
            stmt = select(Profile).where(
                and_(Profile.id == user_id_from_request, Profile.company_reg_no == company_reg_no)
            )
            result = await db.execute(stmt)
            existing_profile = result.scalar_one_or_none()

            if existing_profile:
                is_existing_profile = True
                db_user_id = str(existing_profile.id)

                # Check email uniqueness
                if email != existing_profile.email:
                    stmt = select(Profile).where(
                        and_(
                            Profile.email == email,
                            Profile.company_reg_no == company_reg_no,
                            Profile.id != user_id_from_request,
                        )
                    )
                    result = await db.execute(stmt)
                    if result.first():
                        raise HTTPException(
                            status_code=400,
                            detail=f"Email '{email}' is already in use by another user in your organization.",
                        )
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"User with ID '{user_id_from_request}' not found in your organization.",
                )
        else:
            # Check if email exists
            stmt = select(Profile).where(
                and_(Profile.email == email, Profile.company_reg_no == company_reg_no)
            )
            result = await db.execute(stmt)
            existing_profile = result.scalar_one_or_none()

            if existing_profile:
                is_existing_profile = True
                db_user_id = str(existing_profile.id)

        if not is_existing_profile and not requested_username:
            # Generate username
            base_username = f"{first_name.lower().replace(' ', '')}_{last_name.lower().replace(' ', '')}{random.randint(100, 999)}"
            requested_username = base_username

            # Ensure uniqueness
            stmt = select(Profile).where(
                and_(
                    Profile.username == requested_username, Profile.company_reg_no == company_reg_no
                )
            )
            result = await db.execute(stmt)
            while result.first():
                requested_username = f"{first_name.lower().replace(' ', '')}_{last_name.lower().replace(' ', '')}{random.randint(100, 999)}"
                stmt = select(Profile).where(
                    and_(
                        Profile.username == requested_username,
                        Profile.company_reg_no == company_reg_no,
                    )
                )
                result = await db.execute(stmt)

        if is_existing_profile:
            # Update existing profile
            stmt = (
                update(Profile)
                .where(and_(Profile.id == db_user_id, Profile.company_reg_no == company_reg_no))
                .values(
                    full_name=f"{first_name} {last_name}",
                    email=email,
                    telephone=telephone,
                    company_name=requested_company_name,
                    username=requested_username,
                    updated_at=current_date,
                )
            )
            await db.execute(stmt)
            await db.commit()
            logger.info(f"Profile updated for user ID: {db_user_id} in tenant {company_reg_no}")
            response_registered_since = current_date.isoformat()
        else:
            # Create new user using AuthService
            password = "".join(random.choices(string.ascii_letters + string.digits, k=12))

            user_create_data = UserCreate(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                full_name=f"{first_name} {last_name}",
                username=requested_username,
                telephone=telephone,
                company_name=requested_company_name,
                company_reg_no=company_reg_no,
                email_confirmed=True,
            )

            profile = await AuthService.create_user(db, user_create_data, company_reg_no)
            db_user_id = str(profile.id)

            logger.info(f"Profile created for new user ID: {db_user_id} in tenant {company_reg_no}")

            # Send welcome email
            await send_welcome_email(email, password, requested_username or "User")
            response_registered_since = current_date.isoformat()

        # Handle roles
        if db_user_id and requested_roles is not None:
            # Get role IDs
            stmt = select(Role).where(Role.name.in_(requested_roles))
            result = await db.execute(stmt)
            roles = result.scalars().all()
            role_map = {role.name: role.id for role in roles}

            # Clear existing roles
            stmt = delete(UserRole).where(
                and_(UserRole.user_id == db_user_id, UserRole.company_reg_no == company_reg_no)
            )
            await db.execute(stmt)

            # Add new roles
            for role_name in requested_roles:
                if role_name in role_map:
                    new_user_role = UserRole(
                        user_id=db_user_id,
                        role_id=role_map[role_name],
                        company_reg_no=company_reg_no,
                    )
                    db.add(new_user_role)

            await db.commit()
            logger.info(
                f"Assigned new roles to user ID: {db_user_id} in tenant {company_reg_no} - Roles: {requested_roles}"
            )

        return OrganisationDetails(
            firstName=first_name,
            lastName=last_name,
            email=email,
            telephone=telephone,
            company=requested_company_name,
            registeredSince=response_registered_since,
            user_id=db_user_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error updating organisation details: %s", str(e))
        raise HTTPException(
            status_code=500, detail=f"Error updating organisation details: {str(e)}"
        )


# Delete User
class DeleteUserResponse(BaseModel):
    """Response schema for delete user endpoint"""

    message: str


@app.delete(
    "/api/admin/users/{user_id}",
    status_code=200,
    response_model=DeleteUserResponse,
    dependencies=[Depends(require_roles(["Administrator"]))],
)
async def admin_users_delete(user_id: str, db: AsyncSession = Depends(get_async_db)):
    """Deletes a user from the system."""
    try:
        # Check if user has sessions
        stmt = select(Session.id).where(Session.user_id == user_id).limit(1)
        result = await db.execute(stmt)
        has_session = result.first() is not None

        if not has_session:
            # Hard delete using AuthService
            success = await AuthService.delete_user(db, user_id)
            if success:
                logger.info("Deleted user %s", user_id)
                return {"message": f"User {user_id} permanently deleted."}
            else:
                return {"message": f"User {user_id} was not found, considered deleted."}

        # Soft delete using AuthService
        success = await AuthService.deactivate_user(db, user_id)

        if success:
            logger.info("Deactivated user %s", user_id)
            return {"message": f"User {user_id} successfully deactivated."}
        else:
            logger.warning("User not found for %s", user_id)
            return {"message": f"User {user_id} was not found, considered deleted."}

    except Exception as err:
        logger.error("Unexpected error for %s: %s", user_id, err)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {err}")


# Theme Settings
class GetCompanyThemeSettingsRequest(BaseModel):
    """Request schema for get_company_theme_settings"""

    user_id: str


class CompanyThemeSettingsResponse(BaseModel):
    """Response schema for get_company_theme_settings"""

    id: str
    name: str
    user_chat_bubble_colour: str | None = None
    bot_chat_bubble_colour: str | None = None
    send_button_and_box: str | None = None
    font: str | None = None
    user_chat_font_colour: str | None = None
    bot_chat_font_colour: str | None = None
    logo: str | None = None
    bot_profile_picture: str | None = None


class GetCompanyThemeSettingsResponse(BaseModel):
    """Response schema for get_company_theme_settings"""

    status: str
    theme_settings: CompanyThemeSettingsResponse


def ensure_color_has_hash(color_value: str) -> str:
    """Ensure color value has # prefix if it's a valid color string."""
    if not color_value:
        return color_value
    if color_value.startswith("#"):
        return color_value
    if len(color_value) in [3, 6] and all(c in "0123456789ABCDEFabcdef" for c in color_value):
        return f"#{color_value}"
    return color_value


@app.post("/api/v1/companies/get_theme_settings")
async def get_company_theme_settings(
    request: GetCompanyThemeSettingsRequest, db: AsyncSession = Depends(get_async_db)
):
    """Get company theme settings"""
    try:
        user_id = request.user_id
        logger.info(f"Fetching theme settings for user ID: {user_id}")

        default_settings_response = {
            "status": "success",
            "theme_settings": {
                "id": "default",
                "name": "Default Company",
                "userChatBubbleColor": "#007bff",
                "botChatBubbleColor": "#e5e5ea",
                "sendButtonAndBox": "#ffffff",
                "font": "Tahoma",
                "userChatFontColor": "#000000",
                "botChatFontColor": "#000000",
                "logo": None,
                "botProfilePicture": None,
            },
        }

        # Get profile
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile = result.first()

        if not profile or not profile[0]:
            logger.warning(
                f"No profile or company ID found for user ID: {user_id}, returning defaults."
            )
            return default_settings_response

        company_id = profile[0]

        # Get company
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            logger.warning(f"No company found for company ID: {company_id}, returning defaults.")
            return default_settings_response

        # Transform to response format
        transformed_data = {
            "id": str(company.id),
            "name": company.name,
            "userChatBubbleColor": ensure_color_has_hash(
                company.user_chat_bubble_colour or "#007bff"
            ),
            "botChatBubbleColor": ensure_color_has_hash(
                company.bot_chat_bubble_colour or "#e5e5ea"
            ),
            "sendButtonAndBox": ensure_color_has_hash(company.send_button_and_box or "#ffffff"),
            "font": company.font or "Tahoma",
            "userChatFontColor": ensure_color_has_hash(company.user_chat_font_colour or "#000000"),
            "botChatFontColor": ensure_color_has_hash(company.bot_chat_font_colour or "#000000"),
            "logo": company.logo,
            "botProfilePicture": company.bot_profile_picture,
        }

        return {"status": "success", "theme_settings": transformed_data}

    except Exception as e:
        logger.error(f"Unexpected error in get_company_theme_settings: {str(e)}")
        return default_settings_response


# Root and health endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Vault API is running",
        "status": "ok",
        "version": "2.0.0",
        "database": "PostgreSQL + pgvector + SQLAlchemy",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "database": "connected", "version": "2.0.0"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860, reload=True)
