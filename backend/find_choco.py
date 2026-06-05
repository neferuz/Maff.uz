import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("SELECT id, name, category_id, image_url FROM product WHERE name ILIKE '%Шоколад%' OR name ILIKE '%Chocolate%'"))
        products = res.fetchall()
        for p in products:
            print(f"ID: {p[0]}, Name: {p[1]}, Cat: {p[2]}, Image: {p[3]}")
            
if __name__ == "__main__":
    asyncio.run(main())
