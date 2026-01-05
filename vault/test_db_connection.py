from app.config import settings

print("DATABASE_URL:", settings.DATABASE_URL)
print("Type:", type(settings.DATABASE_URL))

# Check if it contains the right driver
if "asyncpg" in settings.DATABASE_URL:
    print("✅ Using asyncpg driver")
elif "psycopg" in settings.DATABASE_URL:
    print("❌ Using psycopg driver (sync)")
else:
    print("❌ Unknown driver")
