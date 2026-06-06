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
        # Find the category
        res = await conn.execute(text("SELECT id, name, parent_id FROM category WHERE name ILIKE '%baguette%' OR name ILIKE '%багет%';"))
        cats = res.fetchall()
        print("=== Categories ===")
        for c in cats:
            print(f"  ID={c[0]}, Name='{c[1]}', Parent={c[2]}")
        
        if cats:
            cat_id = cats[0][0]
            # Get all products
            res2 = await conn.execute(text(
                "SELECT id, name, price, is_active, image_url FROM product WHERE category_id = :cid ORDER BY name;"),
                {"cid": cat_id})
            rows = res2.fetchall()
            print(f"\n=== Products in category {cat_id} ({len(rows)} total) ===")
            active = 0
            for r in rows:
                status = "ACTIVE" if r[3] else "hidden"
                has_img = "IMG" if r[4] else "no-img"
                print(f"  [{status}] ID={r[0]} | Price={r[2]} | {has_img} | {r[1]}")
                if r[3]:
                    active += 1
            print(f"\nActive: {active}, Total: {len(rows)}")

asyncio.run(main())
