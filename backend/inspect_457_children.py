import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get children of 457
        res = await session.execute(text("SELECT id, name, parent_id, is_active FROM category WHERE parent_id = 457"))
        print("Children of 457:")
        for row in res.fetchall():
            print(row)
            
        # Get all categories with parent_id in {427, 449, 457, 464}
        res = await session.execute(text("SELECT id, name, parent_id, is_active FROM category WHERE parent_id IN (427, 449, 457, 464)"))
        print("\nAll children of excluded IDs:")
        for row in res.fetchall():
            print(row)

if __name__ == "__main__":
    asyncio.run(main())
