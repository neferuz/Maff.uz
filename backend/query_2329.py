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
        res = await conn.execute(text("SELECT id, name, is_active FROM product WHERE id = 2329;"))
        row = res.fetchone()
        if row:
            print(f"ID {row[0]}: {row[1]} (Active: {row[2]})")
        else:
            print("Product 2329 not found")

asyncio.run(main())
