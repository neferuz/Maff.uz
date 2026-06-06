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
        sql = text("SELECT id, name, price, is_active FROM product WHERE category_id = 428 ORDER BY price DESC;")
        res = await conn.execute(sql)
        rows = res.fetchall()
        print(f"Total Porta models in DB: {len(rows)}")
        
        active_cnt = sum(1 for r in rows if r[3])
        inactive_cnt = sum(1 for r in rows if not r[3])
        print(f"Active: {active_cnt}, Inactive (Archived): {inactive_cnt}")
        
        prices = [r[2] for r in rows]
        print(f"Prices: {set(prices)}")

asyncio.run(main())
