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
        res = await conn.execute(text("SELECT id, name, price, is_active FROM product WHERE category_id = 428 AND is_active = true ORDER BY name;"))
        rows = res.fetchall()
        for r in rows:
            print(f"{r[0]} | {r[1]} | Price: {r[2]}")

asyncio.run(main())
