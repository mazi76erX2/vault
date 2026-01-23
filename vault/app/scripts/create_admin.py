import argparse
import asyncio
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.company import Company
from app.models.role import Role, UserRole
from app.models.user import User
from app.schemas.auth import UserCreate
from app.services.authservice import AuthService

ALL_APP_ROLES = ["Administrator", "Collector", "Helper", "Validator", "Expert"]


def async_db_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


async def ensure_company(db: AsyncSession, company_reg_no: str, company_name: str) -> Company:
    res = await db.execute(select(Company).where(Company.company_reg_no == company_reg_no))
    company = res.scalar_one_or_none()
    if not company:
        company = Company(
            name=company_name,
            company_reg_no=company_reg_no,
            contact_email="admin@vault.com",
            registered_since=date(2026, 1, 1),
        )
        db.add(company)
        await db.flush()  # get company.id
    return company


async def create_admin_user(
    email: str, password: str, fullname: str, company_reg_no: str, company_name: str
) -> bool:
    dburl = getattr(settings, "DATABASEURL", None) or getattr(settings, "DATABASE_URL", None)
    if not dburl:
        raise RuntimeError("DATABASEURL / DATABASE_URL is not configured; check your .env")

    engine = create_async_engine(async_db_url(dburl), echo=False)
    async_session_local = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session_local() as db:
        # 1) Prevent duplicates
        res = await db.execute(select(User).where(User.email == email))
        if res.scalar_one_or_none():
            print(f"User with email {email} already exists.")
            return False

        # 2) Ensure company exists
        company = await ensure_company(db, company_reg_no, company_name)

        # 3) Create user + profile
        user_data = UserCreate(
            email=email,
            password=password,
            fullname=fullname,
            company_reg_no=company_reg_no,
            useraccess="admin",
            emailconfirmed=True,
        )
        profile = await AuthService.createuser(db, user_data, company_reg_no)

        # 4) Force profile -> company association (this is what fixes start-chat)
        profile.company_id = company.id
        profile.company_name = company.name
        profile.company_reg_no = company.company_reg_no
        db.add(profile)
        await db.flush()

        # 5) Assign roles for this tenant
        roles_res = await db.execute(select(Role).where(Role.name.in_(ALL_APP_ROLES)))
        roles = roles_res.scalars().all()

        for role in roles:
            db.add(UserRole(user_id=profile.id, role_id=role.id, company_reg_no=company_reg_no))

        await db.commit()
        print(
            f"Admin created: {email} profile_id={profile.id} company_id={company.id} company_reg_no={company_reg_no}"
        )
        return True


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create an admin user (ensures company + profile.company_id)"
    )
    parser.add_argument("email")
    parser.add_argument("password")
    parser.add_argument("fullname")
    parser.add_argument("--company-reg-no", dest="company_reg_no", default="ADMIN001")
    parser.add_argument("--company-name", dest="company_name", default="This Charming")
    args = parser.parse_args()

    asyncio.run(
        create_admin_user(
            args.email, args.password, args.fullname, args.company_reg_no, args.company_name
        )
    )


if __name__ == "__main__":
    main()
