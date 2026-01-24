import asyncio
from sqlalchemy import select
from app.core.database import async_session_maker
from app.models.profile import Profile
from app.models.company import Company
from datetime import datetime

async def update_user_companies():
    async with async_session_maker() as db:
        stmt = select(Company).limit(1)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()
        
        if not company:
            print("No company found. Create a company first.")
            return
        
        print(f"Using company: {company.name} (ID: {company.id})")
        
        stmt = select(Profile).where(Profile.company_id.is_(None))
        result = await db.execute(stmt)
        profiles = result.scalars().all()
        
        print(f"Found {len(profiles)} profiles without company_id")
        
        for profile in profiles:
            profile.company_id = company.id
            profile.company_name = company.name
            profile.company_reg_no = company.company_reg_no
            profile.updated_at = datetime.utcnow()
            print(f"Updated profile: {profile.email}")
        
        await db.commit()
        print(f"Successfully updated {len(profiles)} profiles")

if __name__ == "__main__":
    asyncio.run(update_user_companies())
