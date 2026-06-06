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
        res = await conn.execute(text("SELECT id, name, image_url, images FROM product WHERE id IN (2469, 890, 2472, 2177, 2186)"))
        for p in res.fetchall():
            print(f"ID={p[0]} | URL={repr(p[2])} | IMGS={repr(p[3])}")

asyncio.run(main())
