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
        # Get all laminate subcategories
        res = await conn.execute(text("SELECT id, name FROM category WHERE parent_id = 1 OR id = 1"))
        cats = res.fetchall()
        cat_ids = [c[0] for c in cats]
        cats_str = ",".join(str(c) for c in cat_ids)
        
        for cat in cats:
            res2 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True"))
            total = res2.scalar()
            res3 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True AND image_url IS NOT NULL AND image_url != ''"))
            with_photo = res3.scalar()
            res4 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True AND (image_url IS NULL OR image_url = '')"))
            no_photo = res4.scalar()
            if total > 0:
                print(f"{cat[1]} (cat {cat[0]}): Total={total}, With Photo={with_photo}, NO Photo={no_photo}")
        
        # Show all without photo
        print("\n--- Products WITHOUT photo ---")
        res5 = await conn.execute(text(f"SELECT p.id, p.name, c.name FROM product p JOIN category c ON p.category_id = c.id WHERE p.category_id IN ({cats_str}) AND p.is_active = True AND (p.image_url IS NULL OR p.image_url = '') ORDER BY c.name, p.name"))
        rows = res5.fetchall()
        for r in rows:
            print(f"  ID={r[0]} | Cat={r[2]} | {r[1]}")

asyncio.run(main())
