import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

codes = ["r118", "r102", "r101", "r104", "r099", "r106"]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for code in codes:
            res = await conn.execute(text("SELECT id, name, category_id, is_active FROM product WHERE name ILIKE :query"), {"query": f"%{code}%"})
            print(f"Code {code}:")
            for p in res.fetchall():
                print(f"  ID={p[0]} | {p[1]} | CAT={p[2]} | Active={p[3]}")

asyncio.run(main())
