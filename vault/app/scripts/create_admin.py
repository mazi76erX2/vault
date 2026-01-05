from datetime import datetime, UTC
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.role import Role, UserRole
from app.models.user import User
from app.models.profile import Profile
from app.services.auth_service import AuthService


# Make sure we have an async URL
DATABASE_URL = getattr(settings, "DATABASE_URL", None) or getattr(settings, "DATABASEURL", None)
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL/DATABASEURL not configured")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

async_engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)


async def create_admin_user(
    email: str,
    password: str,
    fullname: str = "System Administrator",
    companyregno: str = "ADMIN001",
) -> bool:
    async with AsyncSessionLocal() as db:
        try:
            # 1) Check if user exists
            result = await db.execute(select(User).where(User.email == email))
            if result.scalar_one_or_none():
                print(f"✅ User with email {email} already exists!")
                return False

            userid = uuid4()
            now = datetime.now(UTC)
            hashedpassword = AuthService.hashpassword(password)

            # 2) Create user (auth.users)
            newuser = User(
                id=userid,
                email=email,
                encryptedpassword=hashedpassword,
                emailconfirmedat=now,
                confirmedat=now,
                createdat=now,
                updatedat=now,
                rawappmetadata={},
                rawusermetadata={"fullname": fullname},
            )
            db.add(newuser)
            await db.flush()
            print(f"✅ Created user in auth.users: {userid}")

            # 3) Create profile (public.profiles)
            newprofile = Profile(
                id=userid,  # Profile.id references User.id
                email=email,
                fullname=fullname,
                username="admin",
                companyregno=companyregno,
                department="Administration",
                useraccess=99,
                status="active",
                createdat=now,
                updatedat=now,
            )
            db.add(newprofile)
            await db.flush()
            print(f"✅ Created profile: {fullname}")

            # 4) Ensure Administrator role exists
            result = await db.execute(select(Role).where(Role.name == "Administrator"))
            adminrole = result.scalar_one_or_none()
            if not adminrole:
                adminrole = Role(
                    name="Administrator",
                    description="Full system administrator with all privileges",
                    createdat=now,
                )
                db.add(adminrole)
                await db.flush()
                print("✅ Created Administrator role")
            else:
                print("✅ Administrator role already exists")

            # 5) Assign role
            userrole = UserRole(
                userid=str(userid),     # if your UserRole.userid is a string FK to profiles.id
                roleid=adminrole.id,
                companyregno=companyregno,
                createdat=now,
            )
            db.add(userrole)

            await db.commit()
            print("✅ Admin user created successfully!")
            return True

        except Exception as e:
            await db.rollback()
            print(f"❌ Error creating admin user: {e}")
            raise
