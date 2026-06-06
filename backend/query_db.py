import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT name FROM product WHERE name ILIKE '%Порта-1 ПП Alaska%';"))
        print([r[0] for r in result.fetchall()])

asyncio.run(main())
