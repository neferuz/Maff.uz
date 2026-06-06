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
        res = await conn.execute(text("SELECT id, name, category_id FROM product WHERE name ILIKE '%Veritas%' OR name ILIKE '%Gusto%' OR name ILIKE '%Opus%' OR name ILIKE '%Liberte%'"))
        rows = res.fetchall()
        for row in rows:
            print(row)
asyncio.run(main())
