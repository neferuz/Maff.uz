import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Search for products with 'egger' in name but maybe different category
        res = await session.execute(text("SELECT id, name, category_id FROM product WHERE name ILIKE '%egger%'"))
        products = res.fetchall()
        print(f"Products with 'egger' in name: {len(products)}")
        for p in products:
            print(f"ID: {p[0]}, Name: {p[1]}, Cat: {p[2]}")
            
        # Search for products containing comfort (maybe russian 'комфорт')
        res = await session.execute(text("SELECT id, name, category_id FROM product WHERE name ILIKE '%комфорт%' OR name ILIKE '%comfort%'"))
        products = res.fetchall()
        print(f"\nProducts with 'comfort' or 'комфорт' in name: {len(products)}")
        for p in products:
            print(f"ID: {p[0]}, Name: {p[1]}, Cat: {p[2]}")

if __name__ == "__main__":
    asyncio.run(main())
