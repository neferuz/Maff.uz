"""
Clean ALL Classic Baguette subcategories.
Archive everything in sub-cats (192-203, 384-385), 
keep only what's already activated in cat 191.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# All Classic Baguette subcategory IDs
SUB_CATS = [192, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 384, 385]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Archive ALL products in ALL subcategories
        total_archived = 0
        for cat_id in SUB_CATS:
            res = await conn.execute(text(
                "UPDATE product SET is_active = false WHERE category_id = :cid AND is_active = true;"
            ), {"cid": cat_id})
            if res.rowcount > 0:
                print(f"  Archived {res.rowcount} in cat {cat_id}")
                total_archived += res.rowcount
        
        print(f"\nTotal archived in subcategories: {total_archived}")
        
        # Now move all our 26 clean products from cat 191 to cat 191 (they stay)
        # Verify what's left active
        res = await conn.execute(text(
            "SELECT id, name, category_id FROM product "
            "WHERE category_id IN (191, 192, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 384, 385) "
            "AND is_active = true ORDER BY name;"
        ))
        rows = res.fetchall()
        print(f"\n=== Still active across all Classic Baguette cats: {len(rows)} ===")
        for r in rows:
            print(f"  cat={r[2]} ID={r[0]} | {r[1]}")

asyncio.run(main())
