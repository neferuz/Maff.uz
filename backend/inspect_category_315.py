import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Category info
        res_cat = await session.execute(text("SELECT id, name, parent_id FROM category WHERE id = 315"))
        cat = res_cat.fetchone()
        if cat:
            print(f"Category 315: Name='{cat[0]}', ParentID={cat[1]}")
        else:
            print("Category 315 not found!")
            
        # Get column names
        res_cols = await session.execute(text("SELECT * FROM product LIMIT 1"))
        print("\nProduct table columns:", res_cols.keys())
        
        # Sample products in Category 315
        res_prod = await session.execute(text("""
            SELECT id, name, price, sku, image_url, is_active
            FROM product 
            WHERE category_id = 315 
            LIMIT 40
        """))
        print("\nProducts in Category 315:")
        for r in res_prod.fetchall():
            print(f"ID: {r[0]} | Name: '{r[1]}' | Price: {r[2]} | SKU: '{r[3]}' | Image: {r[4]} | Active: {r[5]}")

if __name__ == "__main__":
    asyncio.run(main())
