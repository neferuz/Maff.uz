import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Find Coswick category
        res = await session.execute(text("SELECT id FROM category WHERE name ILIKE '%Coswick%' OR name ILIKE '%Косвик%'"))
        cat = res.fetchone()
        if not cat:
            print("Coswick category not found")
            return
            
        cat_id = cat[0]
        print(f"Coswick Category ID: {cat_id}")
        
        # Get products
        res = await session.execute(text(f"SELECT id, name, image_url, category_id FROM product WHERE category_id = {cat_id} OR name ILIKE '%coswick%' OR name ILIKE '%косвик%'"))
        products = res.fetchall()
        print(f"Found {len(products)} products:")
        for p in products:
            print(f"ID: {p[0]}, Name: {p[1]}, Image: {p[2]}, Cat: {p[3]}")
            
if __name__ == "__main__":
    asyncio.run(main())
