import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Query products in category 450
        res = await session.execute(text("SELECT id, name, price, price_outlet, brand, category_id, is_active FROM product WHERE category_id = 450"))
        products = res.fetchall()
        print("Products in category 450:")
        for p in products:
            print(f"ID: {p[0]}, Name: '{p[1]}', Price: {p[2]}, PriceOutlet: {p[3]}, Brand: '{p[4]}', CatID: {p[5]}, Active: {p[6]}")

if __name__ == "__main__":
    asyncio.run(main())
