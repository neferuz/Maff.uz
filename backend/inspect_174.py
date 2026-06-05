import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Find category 174
        res = await session.execute(text("SELECT id, name, parent_id, is_active FROM category WHERE id = 174"))
        print("Category 174:", res.fetchone())
        
        # Find parent_id = None categories
        res = await session.execute(text("SELECT id, name, parent_id, is_active FROM category WHERE parent_id IS NULL"))
        print("\nRoot categories (parent_id IS NULL):")
        for row in res.fetchall():
            print(row)
            
        # Find category 174 children
        res = await session.execute(text("SELECT id, name, parent_id, is_active FROM category WHERE parent_id = 174"))
        print("\nChildren of 174:")
        for row in res.fetchall():
            print(row)

if __name__ == "__main__":
    asyncio.run(main())
