import argparse
import asyncio
import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import Profile
from app.models.company import Company
from app.models.project import Project
from app.models.role import Role
from app.models.user_type import UserType


def async_db_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


DEFAULT_ROLES = [
    (
        "b86db406-e7b5-4cc0-ad2c-39cf0557f367",
        "Administrator",
        "Full access to the HVMC - User management, Themes, Applications and data sources",
    ),
    (
        "6674adfb-c0d2-4e02-9b71-f569653d9782",
        "Collector",
        "Access to the collector option on the dashboard",
    ),
    (
        "640955e7-f8ff-4133-bbd5-41b5eab8cb5a",
        "Helper",
        "End user function of Vault - Allows access to the Helper chat function from the dashboard",
    ),
    (
        "e49d4a8e-d1ad-4906-82ac-41b875ad0223",
        "Validator",
        "Access to the validator option on the dashboard",
    ),
    (
        "4abdeb04-f908-472a-92d0-8d8b1cb6208e",
        "Expert",
        "Access to the expert option on the dashboard",
    ),
]


DEFAULT_USERTYPES = [
    (1, "Administrator", "System administrator with full access"),
    (2, "Manager", "Department manager with elevated privileges"),
    (3, "Employee", "Regular employee with standard access"),
    (4, "Guest", "Limited access guest user"),
]


async def seed(company_reg_no: str) -> None:
    dburl = getattr(settings, "DATABASEURL", None) or getattr(settings, "DATABASE_URL", None)
    if not dburl:
        raise RuntimeError("DATABASEURL / DATABASE_URL is not configured; check your .env")

    engine = create_async_engine(async_db_url(dburl), echo=False)
    async_session_local = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session_local() as db:
        # 1) Company (tenant)
        company_res = await db.execute(
            select(Company).where(Company.company_reg_no == company_reg_no)
        )
        company = company_res.scalar_one_or_none()
        if not company:
            company = Company(
                id=1,
                name="This Charming",
                company_reg_no=company_reg_no,
                contact_email="admin@tc.com",
                registered_since=date(2026, 1, 1),
            )
            db.add(company)
            await db.flush()
        else:
            company.name = "This Charming"
            company.contact_email = "admin@tc.com"
            if not company.registered_since:
                company.registered_since = date(2026, 1, 1)

        # 2) User types
        for type_id, name, description in DEFAULT_USERTYPES:
            res = await db.execute(select(UserType).where(UserType.name == name))
            ut = res.scalar_one_or_none()
            if not ut:
                db.add(UserType(id=type_id, name=name, description=description))

        # 3) Roles
        for role_id, name, description in DEFAULT_ROLES:
            res = await db.execute(select(Role).where(Role.name == name))
            role = res.scalar_one_or_none()
            if not role:
                db.add(Role(id=role_id, name=name, description=description))
            else:
                role.description = description

        await db.commit()

        # 4) Default Project
        await seed_default_project(db, company, company_reg_no)

        print(f"✅ Seed complete for company_reg_no={company_reg_no}")


async def seed_default_project(db: AsyncSession, company: Company, company_reg_no: str) -> None:
    """Seed default project for the company."""

    # Find profile by company_reg_no (this is more reliable)
    profile_res = await db.execute(
        select(Profile).where(Profile.company_reg_no == company_reg_no).limit(1)
    )
    profile = profile_res.scalar_one_or_none()

    if not profile:
        # Try finding any profile if company_reg_no doesn't match
        profile_res = await db.execute(select(Profile).limit(1))
        profile = profile_res.scalar_one_or_none()
        
    if not profile:
        print("⚠️  No profiles found. Skipping default project creation.")
        print("   Create a user account first, then run seed again to create the project.")
        return

    print(f"📋 Found profile: {profile.full_name} ({profile.id})")
    print(f"   company_reg_no: {profile.company_reg_no}")
    print(f"   company_id: {profile.company_id}")

    # Check if default project already exists for this company_reg_no
    project_res = await db.execute(
        select(Project).where(
            Project.name == "General Knowledge Base",
            Project.company_reg_no == company_reg_no
        )
    )
    existing_project = project_res.scalar_one_or_none()

    if existing_project:
        print(f"✅ Default project already exists: {existing_project.name}")
        return

    # Create default project using profile's company info
    default_project = Project(
        id=uuid.uuid4(),
        name="General Knowledge Base",
        description="Default project for general knowledge collection",
        manager_id=profile.id,
        company_id=profile.company_id or str(company.id),  # Use profile's company_id
        company_reg_no=profile.company_reg_no or company_reg_no,  # Use profile's company_reg_no
        status="active",
    )

    db.add(default_project)
    await db.commit()

    print(f"✅ Created default project: {default_project.name} (ID: {default_project.id})")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed Vault reference data (companies, usertypes, roles, projects)"
    )
    parser.add_argument("--company-reg-no", dest="company_reg_no", default="ADMIN001")
    args = parser.parse_args()
    asyncio.run(seed(args.company_reg_no))


if __name__ == "__main__":
    main()