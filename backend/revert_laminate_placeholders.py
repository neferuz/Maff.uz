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
        res = await conn.execute(text("UPDATE product SET image_url = NULL WHERE image_url = '/products/laminate-1.png'"))
        print(f"Reverted {res.rowcount} placeholder photos back to NULL.")

asyncio.run(main())
