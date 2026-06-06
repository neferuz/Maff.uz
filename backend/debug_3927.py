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
        # Check product 3927
        res = await conn.execute(text("SELECT id, name, category_id, price, is_active, image_url FROM product WHERE id = 3927;"))
        row = res.fetchone()
        if row:
            print(f"Product 3927: {row[1]}")
            print(f"  Category: {row[2]}, Price: {row[3]}, Active: {row[4]}")
            print(f"  Image: {row[5]}")
        
        # Check what siblings the frontend would find
        # The frontend groups by cleanTitle - let's see what's in the same category that's active
        cat_id = row[2] if row else 191
        res2 = await conn.execute(text(
            "SELECT id, name, category_id, is_active, image_url FROM product "
            "WHERE is_active = true AND (category_id = :cid OR name ILIKE '%Неаполь%' OR name ILIKE '%Турин%B1%') "
            "ORDER BY name;"
        ), {"cid": cat_id})
        rows2 = res2.fetchall()
        print(f"\n=== Active products matching (cat={cat_id} or Неаполь/Турин B1) ===")
        for r in rows2:
            has_img = "IMG" if r[4] else "no-img"
            print(f"  [{has_img}] ID={r[0]} cat={r[2]} | {r[1]}")

asyncio.run(main())
