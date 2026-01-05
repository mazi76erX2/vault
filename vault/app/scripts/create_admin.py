import argparse
import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.role import Role, UserRole
from app.models.user import User
from app.schemas.auth import UserCreate
from app.services.auth_service import AuthService


def _async_db_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


async def create_admin_user(email: str, password: str, full_name: str, company_reg_no: str) -> bool:
    db_url = getattr(settings, "DATABASEURL", None) or getattr(settings, "DATABASE_URL", None)
    if not db_url:
        raise RuntimeError("DATABASE_URL / DATABASEURL is not configured (check your .env)")

    engine = create_async_engine(_async_db_url(db_url), echo=False)
    AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        # 1) Check if user already exists
        res = await db.execute(select(User).where(User.email == email))
        if res.scalar_one_or_none():
            print(f"User with email {email} already exists.")
            return False

        # 2) Create user + profile via AuthService
        user_data = UserCreate(
            email=email,
            password=password,
            full_name=full_name,
            company_reg_no=company_reg_no,
            user_access="admin",
            email_confirmed=True,
        )

        profile = await AuthService.create_user(db, user_data, company_reg_no)

        # 3) Assign Administrator role (if it exists)
        role_res = await db.execute(select(Role).where(Role.name == "Administrator"))
        admin_role = role_res.scalar_one_or_none()
        if admin_role:
            db.add(
                UserRole(
                    user_id=profile.id,
                    role_id=admin_role.id,
                    company_reg_no=company_reg_no,
                )
            )
            await db.commit()

        print(f"✅ Admin created: {email} (profile_id={profile.id}, company_reg_no={company_reg_no})")
        return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("email")
    parser.add_argument("password")
    parser.add_argument("full_name")
    parser.add_argument("--company-reg-no", dest="company_reg_no", default="ADMIN001")
    args = parser.parse_args()

    asyncio.run(create_admin_user(args.email, args.password, args.full_name, args.company_reg_no))


if __name__ == "__main__":
    main()
