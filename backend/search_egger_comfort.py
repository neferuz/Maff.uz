import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Search categories
        res = await session.execute(text("SELECT id, name, parent_id FROM category WHERE name ILIKE '%comfort%' OR name ILIKE '%egger%'"))
        categories = res.fetchall()
        print("Categories matching 'comfort' or 'egger':")
        for c in categories:
            print(f"ID: {c[0]}, Name: {c[1]}, Parent: {c[2]}")
            
        # Search products
        res = await session.execute(text("SELECT id, name, category_id FROM product WHERE name ILIKE '%comfort%' OR name ILIKE '%egger%'"))
        products = res.fetchall()
        print(f"\nFound {len(products)} products matching 'comfort' or 'egger':")
        for p in products[:20]:
            print(f"ID: {p[0]}, Name: {p[1]}, Category ID: {p[2]}")
        if len(products) > 20:
            print(f"... and {len(products) - 20} more.")

if __name__ == "__main__":
    asyncio.run(main())
