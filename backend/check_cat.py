import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("SELECT * FROM category WHERE id = 414"))
        cat = res.fetchone()
        columns = res.keys()
        if cat:
            for c, v in zip(columns, cat):
                print(f"{c}: {v}")
                
if __name__ == "__main__":
    asyncio.run(main())
