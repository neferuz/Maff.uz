import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.models.base import Base
# We need to import all models so Base knows about them
from app.models.user import User
from app.models.otp import OTP

async def main():
    # Construct DB URL if not set
    if settings.DATABASE_URL:
        db_url = settings.DATABASE_URL
    else:
        db_url = f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}/{settings.POSTGRES_DB}"
    
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        # 1. Create otp table if not exists (using Base.metadata)
        await conn.run_sync(Base.metadata.create_all)
        
        # 2. Add phone column to user table if it doesn't exist
        try:
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN phone VARCHAR'))
            print("Added phone column to user table")
        except Exception as e:
            if "already exists" in str(e).lower() or "DuplicateColumn" in str(type(e)):
                print("Phone column already exists")
            else:
                print(f"Error adding phone column: {e}")

    await engine.dispose()
    print("Database schema updated")

if __name__ == "__main__":
    asyncio.run(main())
