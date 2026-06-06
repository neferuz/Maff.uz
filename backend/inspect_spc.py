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
        res = await conn.execute(text("SELECT id, name FROM category WHERE name ILIKE '%Kronofloor%' OR name ILIKE '%ROCKO%' OR name ILIKE '%SPC%'"))
        categories = res.fetchall()
        print("Categories:")
        for c in categories:
            print(f"  ID={c[0]} | {c[1]}")
            
        print("\nProducts in these categories:")
        cat_ids = [c[0] for c in categories]
        if cat_ids:
            res_prod = await conn.execute(text(f"SELECT id, category_id, name, is_active FROM product WHERE category_id IN ({','.join(map(str, cat_ids))}) AND is_active = True ORDER BY category_id, name"))
            for p in res_prod.fetchall():
                print(f"  CAT={p[1]} | ID={p[0]} | {p[2]}")

asyncio.run(main())
