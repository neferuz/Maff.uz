import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check products in category 457
        res = await session.execute(text("SELECT COUNT(*) FROM product WHERE category_id = 457 AND is_active = True"))
        print("Active products in category 457:", res.scalar())
        
        # Check products in category 449
        res = await session.execute(text("SELECT COUNT(*) FROM product WHERE category_id = 449 AND is_active = True"))
        print("Active products in category 449:", res.scalar())
        
        # Check products in category 427
        res = await session.execute(text("SELECT COUNT(*) FROM product WHERE category_id = 427 AND is_active = True"))
        print("Active products in category 427:", res.scalar())
        
        # Check products in category 464
        res = await session.execute(text("SELECT COUNT(*) FROM product WHERE category_id = 464 AND is_active = True"))
        print("Active products in category 464:", res.scalar())

if __name__ == "__main__":
    asyncio.run(main())
