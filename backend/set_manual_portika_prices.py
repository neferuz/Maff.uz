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
        # Set manual prices for the remaining 4 products
        fixes = [
            (5666, 786500), # Классико-12.3 ЭКО Light Sonoma
            (5667, 786500),
            (5657, 1244100), # Классико-12 ПП Alaska
            (5658, 1244100),
        ]
        for pid, price in fixes:
            await conn.execute(text("UPDATE product SET price = :p WHERE id = :pid"), {"p": price, "pid": pid})
            print(f"Updated ID={pid} to {price} UZS")

asyncio.run(main())
