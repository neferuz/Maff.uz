import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(
            text("SELECT id, name, category_id, image_url, sku, is_active FROM product WHERE name ILIKE '%Венеция%' AND name ILIKE '%ПО%' AND name ILIKE '%В3%'")
        )
        products = res.fetchall()
        print(f"Total Venice ПО В3 products: {len(products)}")
        for p in products:
            print(f"ID={p[0]} | SKU={p[4]} | Cat={p[2]} | Active={p[5]} | Image={p[3]} | Name='{p[1]}'")

if __name__ == "__main__":
    asyncio.run(main())
