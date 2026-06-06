import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os, re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text(
            "SELECT id, name, is_active, image_url, images FROM product "
            "WHERE category_id IN (357, 184, 185, 186, 187, 380, 381, 382) AND is_active = True "
            "ORDER BY name;"
        ))
        products = res.fetchall()
        for p in products:
            img = p[3] or (p[4][0] if p[4] else "None")
            print(f"ID={p[0]} | {p[1]}\n   IMG: {img}")

asyncio.run(main())
