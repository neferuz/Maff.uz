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
        res = await conn.execute(text("SELECT id, name FROM category WHERE parent_id = 1 OR id = 1"))
        cat_ids = [c[0] for c in res.fetchall()]
        cats_str = ",".join(str(c) for c in cat_ids)
        res = await conn.execute(text(f"SELECT id, name, image_url, is_active FROM product WHERE category_id IN ({cats_str}) AND image_url IS NOT NULL"))
        products = res.fetchall()
        for p in products:
            print(f"ID={p[0]} | Active={p[3]} | {p[2]} | {p[1]}")

asyncio.run(main())
