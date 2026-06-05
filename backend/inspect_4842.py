import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check product 4842 image fields
        res = await session.execute(text("SELECT id, name, image_url, images FROM product WHERE id = 4842"))
        row = res.fetchone()
        print("Product 4842 DB data:")
        print(f"ID: {row[0]}")
        print(f"Name: {row[1]}")
        print(f"Image URL: {row[2]}")
        print(f"Images (raw): {row[3]}")
        
        # Check all products in category 450
        res = await session.execute(text("SELECT id, name, image_url, images FROM product WHERE category_id = 450"))
        print("\nAll products in category 450:")
        for r in res.fetchall():
            print(f"ID: {r[0]}, Name: {r[1]}, Image URL: {r[2]}, Images: {r[3]}")

if __name__ == "__main__":
    asyncio.run(main())
