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
        res = await conn.execute(text("SELECT id, name FROM product WHERE category_id IN (361, 362) AND name ILIKE '%(Образец)%'"))
        products = res.fetchall()
        for p in products:
            new_name = p[1].replace("(Образец)", "").strip()
            print(f"Renaming: {p[1]} -> {new_name}")
            await conn.execute(text("UPDATE product SET name = :new_name WHERE id = :id"), {"new_name": new_name, "id": p[0]})
        print(f"Updated {len(products)} products.")

asyncio.run(main())
