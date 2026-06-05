import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        await session.execute(text("UPDATE product SET image_url = '/static/uploads/coswick_molochniy_shokolad.png' WHERE name ILIKE '%Молочный Шоколад%' AND category_id = 406"))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(main())
