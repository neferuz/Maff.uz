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
        res = await conn.execute(text("SELECT id, name, category_id, price, is_active FROM product WHERE name LIKE '%Френте%'"))
        rows = res.fetchall()
        print("Frente products in PostgreSQL:")
        for r in rows:
            print(f"  ID={r.id} | Name='{r.name}' | Cat={r.category_id} | Price={r.price} | Active={r.is_active}")

asyncio.run(main())
