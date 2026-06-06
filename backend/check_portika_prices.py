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
        # Find category 323 and children
        res = await conn.execute(text(
            "SELECT id, name, parent_id FROM category WHERE id = 323 OR parent_id = 323 ORDER BY id;"
        ))
        cats = res.fetchall()
        print("=== Portika categories ===")
        cat_ids = []
        for c in cats:
            print(f"  ID={c[0]} | {c[1]}")
            cat_ids.append(c[0])
        
        # Get all active products with 0 price
        all_ids = ','.join(str(c) for c in cat_ids)
        res2 = await conn.execute(text(
            f"SELECT id, name, price, category_id FROM product "
            f"WHERE category_id IN ({all_ids}) AND is_active = true ORDER BY category_id, name;"
        ))
        rows = res2.fetchall()
        zero_count = 0
        print(f"\n=== Active products ({len(rows)} total) ===")
        for r in rows:
            if r[2] == 0 or r[2] is None:
                print(f"  ❌ ZERO | cat={r[3]} ID={r[0]} | {r[1]}")
                zero_count += 1
        print(f"\nProducts with price=0: {zero_count} out of {len(rows)}")

asyncio.run(main())
