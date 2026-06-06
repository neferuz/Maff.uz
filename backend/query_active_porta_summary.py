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
        sql = text("SELECT id, name FROM product WHERE category_id = 428 AND is_active = true;")
        res = await conn.execute(sql)
        rows = res.fetchall()
        
        print(f"Total active Porta products: {len(rows)}")
        for r in sorted(rows, key=lambda x: x[1]):
            print(f" - {r[1]}")

asyncio.run(main())
