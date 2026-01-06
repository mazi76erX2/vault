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


def async_db_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


ALL_APP_ROLES = ["Administrator", "Collector", "Helper", "Validator", "Expert"]


async def create_admin_user(email: str, password: str, fullname: str, companyregno: str) -> bool:
    dburl = getattr(settings, "DATABASEURL", None) or getattr(settings, "DATABASE_URL", None)
    if not dburl:
        raise RuntimeError("DATABASEURL / DATABASE_URL is not configured; check your .env")

    engine = create_async_engine(async_db_url(dburl), echo=False)
    async_session_local = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session_local() as db:
        res = await db.execute(select(User).where(User.email == email))
        if res.scalar_one_or_none():
            print(f"User with email {email} already exists.")
            return False

        user_data = UserCreate(
            email=email,
            password=password,
            fullname=fullname,
            company_reg_no=companyregno,
            useraccess="admin",
            emailconfirmed=True,
        )

        profile = await AuthService.create_user(db, user_data, companyregno)

        roles_res = await db.execute(select(Role).where(Role.name.in_(ALL_APP_ROLES)))
        roles = roles_res.scalars().all()

        found_role_names = {r.name for r in roles}
        missing_role_names = [r for r in ALL_APP_ROLES if r not in found_role_names]
        if missing_role_names:
            print(f"Warning: roles not found in roles table: {missing_role_names}")

        for role in roles:
            db.add(
                UserRole(
                    user_id=profile.id,
                    role_id=role.id,
                    company_reg_no=companyregno,
                )
            )

        await db.commit()
        print(
            f"Admin created: email={email}, profile_id={profile.id}, "
            f"companyregno={companyregno}, roles={sorted(found_role_names)}"
        )
        return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("email")
    parser.add_argument("password")
    parser.add_argument("fullname")
    parser.add_argument("--company-reg-no", dest="companyregno", default="ADMIN001")
    args = parser.parse_args()

    asyncio.run(create_admin_user(args.email, args.password, args.fullname, args.companyregno))


if __name__ == "__main__":
    main()
