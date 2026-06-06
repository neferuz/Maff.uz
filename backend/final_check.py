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
        res = await conn.execute(text(
            "SELECT name, image_url FROM product "
            "WHERE category_id IN (357, 184, 185, 186, 187, 380, 381, 382) AND is_active = True "
            "ORDER BY name"
        ))
        for row in res.fetchall():
            print(f"{row[0]} => {row[1]}")

asyncio.run(main())
