import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(
            text("SELECT p.id, p.name, p.category_id, c.name FROM product p JOIN category c ON p.category_id = c.id WHERE p.name ILIKE '%rodin%' OR p.name ILIKE '%odin%'")
        )
        products = res.fetchall()
        for p in products:
            print(f"ID={p[0]} | Name='{p[1]}' | CategoryID={p[2]} | CategoryName='{p[3]}'")

if __name__ == "__main__":
    asyncio.run(main())
