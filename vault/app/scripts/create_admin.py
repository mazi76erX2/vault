"""
Create admin user with all privileges
"""

import asyncio
import sys
from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models.role import Role, UserRole
from app.models.user import User
from app.models.profile import Profile
from app.services.auth_service import AuthService


# Create async engine and session
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
async_engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_admin_user(
    email: str,
    password: str,
    full_name: str = "System Administrator",
    company_reg_no: str = "ADMIN001",
):
    """Create admin user with all privileges"""
    
    async with AsyncSessionLocal() as db:
        try:
            print(f"Creating admin user: {email}")
            
            # Check if user already exists
            result = await db.execute(select(User).where(User.email == email))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print(f"❌ User with email {email} already exists!")
                return False
            
            # Create user
            user_id = uuid4()
            hashed_password = AuthService.hash_password(password)
            
            now = datetime.utcnow()
            new_user = User(
                id=user_id,
                email=email,
                encrypted_password=hashed_password,
                email_confirmed_at=now,
                confirmed_at=now,
                is_active=True,
                created_at=now,
                updated_at=now,
                raw_app_meta_data={},
                raw_user_meta_data={"full_name": full_name},
            )
            db.add(new_user)
            await db.flush()
            
            print(f"✅ Created user in auth.users: {user_id}")
            
            # Create profile
            new_profile = Profile(
                id=str(user_id),
                user_id=user_id,
                email=email,
                full_name=full_name,
                username="admin",
                company_reg_no=company_reg_no,
                department="Administration",
                user_access=99,  # Highest access level
                status="active",
                created_at=now,
                updated_at=now,
            )
            db.add(new_profile)
            
            print(f"✅ Created profile: {full_name}")
            
            # Ensure admin role exists
            result = await db.execute(select(Role).where(Role.name == "Administrator"))
            admin_role = result.scalar_one_or_none()
            
            if not admin_role:
                admin_role = Role(
                    name="Administrator",
                    description="Full system administrator with all privileges",
                    created_at=now,
                )
                db.add(admin_role)
                await db.flush()
                print("✅ Created Administrator role")
            else:
                print("✅ Administrator role already exists")
            
            # Assign admin role to user
            user_role = UserRole(
                user_id=str(user_id),
                role_id=admin_role.id,
                company_reg_no=company_reg_no,
                created_at=now,
            )
            db.add(user_role)
            
            print("✅ Assigned Administrator role to user")
            
            # Commit all changes
            await db.commit()
            
            print("\n" + "=" * 50)
            print("✅ Admin user created successfully!")
            print("=" * 50)
            print(f"Email: {email}")
            print(f"Password: {password}")
            print(f"Role: Administrator")
            print(f"User ID: {user_id}")
            print(f"Company Reg No: {company_reg_no}")
            print("=" * 50)
            
            return True
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error creating admin user: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


async def main():
    """Main function"""
    print("\n" + "=" * 50)
    print("Admin User Creation Script")
    print("=" * 50 + "\n")
    
    # Get admin details from command line or use defaults
    if len(sys.argv) >= 3:
        email = sys.argv[1]
        password = sys.argv[2]
        full_name = sys.argv[3] if len(sys.argv) >= 4 else "System Administrator"
    else:
        # Interactive mode
        email = input("Admin email: ").strip()
        password = input("Admin password: ").strip()
        full_name = input("Full name (default: System Administrator): ").strip() or "System Administrator"
    
    if not email or not password:
        print("❌ Email and password are required!")
        return
    
    if len(password) < 8:
        print("❌ Password must be at least 8 characters!")
        return
    
    success = await create_admin_user(email, password, full_name)
    
    if success:
        print("\n🎉 You can now log in with these credentials!")
        print("💡 Use POST /api/auth/login to authenticate")
    else:
        print("\n❌ Failed to create admin user")


if __name__ == "__main__":
    asyncio.run(main())
