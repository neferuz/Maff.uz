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
        res = await conn.execute(text("SELECT id, name, price, category_id FROM product WHERE name ILIKE '%egger%' OR name ILIKE '%kronopol%' OR name ILIKE '%ЛП %' OR category_id IN (1, 80, 94, 101, 107, 109, 316, 397, 56, 68, 414) LIMIT 15"))
        for p in res.fetchall():
            print(f"ID={p[0]} | Price={p[2]} | Cat={p[3]} | {p[1]}")

asyncio.run(main())
