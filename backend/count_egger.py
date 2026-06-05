import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    cats = [101, 102, 103, 104, 105, 106, 397, 414]
    
    async with async_session() as session:
        for c in cats:
            res = await session.execute(text(f"SELECT COUNT(*) FROM product WHERE category_id = {c}"))
            count = res.scalar()
            print(f"Category {c}: {count} products")
            
if __name__ == "__main__":
    asyncio.run(main())
