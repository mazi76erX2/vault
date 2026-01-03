from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db  # Remove supabase import
from app.schemas import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=UserResponse)
async def signup(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """Register a new user"""
    auth_service = AuthService(db)
    return await auth_service.create_user(user_data)

@router.post("/login")
async def login(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_async_db)
):
    """Login user"""
    auth_service = AuthService(db)
    return await auth_service.authenticate_user(email, password)
