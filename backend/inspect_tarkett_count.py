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
        res = await conn.execute(text("SELECT id, name, parent_id FROM category WHERE parent_id = 360 OR id = 360"))
        cats = res.fetchall()
        for c in cats:
            print(f"Cat: ID={c[0]} | {c[1]} | Parent={c[2]}")
            
        cat_ids = [c[0] for c in cats]
        if cat_ids:
            res_prod = await conn.execute(text(f"SELECT id, category_id, name, price, is_active FROM product WHERE category_id IN ({','.join(map(str, cat_ids))})"))
            print("\nAll Products (active and inactive):")
            for p in res_prod.fetchall():
                print(f"  CAT={p[1]} | ID={p[0]} | Price={p[3]} | Active={p[4]} | {p[2]}")

asyncio.run(main())
