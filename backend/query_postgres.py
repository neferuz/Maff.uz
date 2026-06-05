import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    print("Database URL:", settings.DATABASE_URL)
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get category count
        res = await session.execute(text("SELECT COUNT(*) FROM category"))
        print("Total categories:", res.scalar())
        
        # Get product count
        res = await session.execute(text("SELECT COUNT(*) FROM product"))
        print("Total products:", res.scalar())
        
        # Get count of products in category 115 to 135
        res = await session.execute(text("SELECT COUNT(*) FROM product WHERE category_id BETWEEN 115 AND 135"))
        print("Products in categories 115-135:", res.scalar())
        
        # Sample products in categories 115-135
        res = await session.execute(text(
            "SELECT id, name, image_url, images, category_id, sku FROM product WHERE name ILIKE '%Порта%' OR name ILIKE '%Porta%' LIMIT 40"
        ))
        print("\nPorta door products:")
        for row in res.fetchall():
            print(f"ID: {row[0]}, Name: '{row[1]}', Image: '{row[2]}', Images: {row[3]}, Cat: {row[4]}, SKU: '{row[5]}'")

if __name__ == "__main__":
    asyncio.run(main())
