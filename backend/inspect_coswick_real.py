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
        res = await conn.execute(text("SELECT id, name, is_active FROM product WHERE category_id = 406 AND name NOT ILIKE '%Щит рекл%'"))
        products = res.fetchall()
        for p in products:
            print(f"ID={p[0]} | Active={p[2]} | {p[1]}")

asyncio.run(main())
