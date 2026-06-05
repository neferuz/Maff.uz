import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Search for products with Filomuro in name
        res = await session.execute(text(
            "SELECT id, name, category_id FROM product WHERE name ILIKE '%Filomuro%' LIMIT 80"
        ))
        print("Filomuro products:")
        for row in res.fetchall():
            print(f"ID: {row[0]}, Category: {row[2]}, Name: '{row[1]}'")
            
        # Search for products with Elen in name
        res = await session.execute(text(
            "SELECT id, name, category_id FROM product WHERE name ILIKE '%Elen%' LIMIT 80"
        ))
        print("\nElen products:")
        for row in res.fetchall():
            print(f"ID: {row[0]}, Category: {row[2]}, Name: '{row[1]}'")

if __name__ == "__main__":
    asyncio.run(main())
