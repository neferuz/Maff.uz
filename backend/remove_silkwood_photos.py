import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check products in category 418
        res = await session.execute(text("SELECT id, name, image_url FROM product WHERE category_id = 418"))
        products = res.fetchall()
        print(f"Found {len(products)} products in category 418.")
        for p in products:
            print(f"ID: {p[0]}, Name: {p[1]}, Image: {p[2]}")
            
        # Update them to have no photo
        await session.execute(text("UPDATE product SET image_url = NULL WHERE category_id = 418"))
        await session.commit()
        print("Updated successfully.")

if __name__ == "__main__":
    asyncio.run(main())
