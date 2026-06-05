import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check Silkwood
        res = await session.execute(text("SELECT id, name, image_url, sku, category_id FROM product WHERE name ILIKE '%Silkwood%' OR name ILIKE '%Силквуд%'"))
        print("Silkwood products:")
        for row in res.fetchall():
            print(f"ID: {row[0]} | Name: {row[1]} | Image: {row[2]} | SKU: {row[3]} | Cat: {row[4]}")
            
        # Check Kronofloor
        res = await session.execute(text("SELECT id, name, image_url, sku, category_id FROM product WHERE name ILIKE '%Kronofloor%' OR name ILIKE '%Кронофлор%'"))
        print("\nKronofloor products:")
        for row in res.fetchall():
            print(f"ID: {row[0]} | Name: {row[1]} | Image: {row[2]} | SKU: {row[3]} | Cat: {row[4]}")

if __name__ == "__main__":
    asyncio.run(main())
