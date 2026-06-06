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
        await conn.execute(text("UPDATE product SET category_id = 409 WHERE name ILIKE '%Lines (битум плитка)%' AND category_id IS NULL"))
        print("Updated category for Lines.")

asyncio.run(main())
