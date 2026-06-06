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
        res = await conn.execute(text("SELECT id, name, price FROM product WHERE category_id IN (360, 406) AND is_active = True"))
        for p in res.fetchall():
            print(f"ID={p[0]} | Price={p[2]} | {p[1]}")

asyncio.run(main())
