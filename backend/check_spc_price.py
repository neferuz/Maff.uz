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
        res = await conn.execute(text("SELECT id, name, price, is_active FROM product WHERE name ILIKE '%Kronofloor%' OR name ILIKE '%ROCKO%' OR name ILIKE '%SPC%' LIMIT 20"))
        for p in res.fetchall():
            print(f"ID={p[0]} | Price={p[2]} | Active={p[3]} | {p[1]}")

asyncio.run(main())
