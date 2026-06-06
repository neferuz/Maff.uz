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
        res = await conn.execute(text("SELECT id, name FROM product WHERE category_id = 112 AND (name ILIKE '%каталог%' OR name ILIKE '%образец%' OR name ILIKE '%стэнд%' OR name ILIKE '%собранный%')"))
        samples = res.fetchall()
        for p in samples:
            await conn.execute(text("UPDATE product SET is_active = False WHERE id = :id"), {"id": p[0]})
            print(f"Archived sample: {p[1]}")

asyncio.run(main())
