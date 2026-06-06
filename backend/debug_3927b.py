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
        res = await conn.execute(text("SELECT id, name, category_id, price, is_active, image_url FROM product WHERE id = 3927;"))
        row = res.fetchone()
        print(f"Product 3927: {row[1]}")
        print(f"  Category: {row[2]}, Active: {row[4]}")
        
        # Now check what other active products share category 192
        if row:
            cat = row[2]
            res2 = await conn.execute(text(
                "SELECT id, name, is_active, image_url FROM product "
                "WHERE category_id = :cid AND is_active = true ORDER BY name;"
            ), {"cid": cat})
            rows2 = res2.fetchall()
            print(f"\n=== Active in category {cat} ({len(rows2)} total) ===")
            for r in rows2:
                has_img = "IMG" if r[3] else "no-img"
                print(f"  [{has_img}] ID={r[0]} | {r[1]}")

asyncio.run(main())
