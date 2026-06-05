import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Query products containing "Квалитет" or "Kvalitet"
        res = await session.execute(text(
            "SELECT id, name, image_url, images, price, is_active FROM product "
            "WHERE name ILIKE '%Квалитет%' OR name ILIKE '%Kvalitet%' "
            "ORDER BY name ASC LIMIT 30"
        ))
        print("Kvalitet products:")
        for row in res.fetchall():
            print(f"ID: {row[0]}, Name: '{row[1]}', Image: '{row[2]}', Images: '{row[3]}', Price: {row[4]}, Active: {row[5]}")

if __name__ == "__main__":
    asyncio.run(main())
