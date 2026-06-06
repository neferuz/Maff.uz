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
        sql = text("UPDATE product SET is_active = true WHERE category_id = 428 AND name ILIKE '%Порта-58%' AND (name ILIKE '%Natural Oak%' OR name ILIKE '%Keramik Brown%');")
        res = await conn.execute(sql)
        print(f"Reactivated {res.rowcount} Порта-58 products.")

asyncio.run(main())
