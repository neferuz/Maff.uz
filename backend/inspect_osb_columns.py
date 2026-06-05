import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("""
            SELECT id, name, thickness, specifications, description
            FROM product 
            WHERE category_id = 315
        """))
        for r in res.fetchall():
            print(f"ID: {r[0]} | Name: '{r[1]}' | Thickness: '{r[2]}' | Specs: {r[3]} | Desc: {r[4]}")

if __name__ == "__main__":
    asyncio.run(main())
