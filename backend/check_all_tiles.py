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
        res = await conn.execute(text("SELECT id, name, category_id, is_active FROM product WHERE name ILIKE '%плитк%' OR name ILIKE '%ковро%' OR name ILIKE '%SAG%'"))
        for p in res.fetchall():
            print(f"ID={p[0]} | Cat={p[2]} | Active={p[3]} | {p[1]}")

asyncio.run(main())
