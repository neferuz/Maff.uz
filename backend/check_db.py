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
        res = await conn.execute(text("SELECT id, name, image_url FROM product WHERE name LIKE '%EHL038%'"))
        row = res.fetchone()
        print(f"EHL038: {row}")
asyncio.run(main())
