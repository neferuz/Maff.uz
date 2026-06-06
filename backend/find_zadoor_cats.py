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
        # Find parent category 176 and all children
        res = await conn.execute(text(
            "SELECT id, name, parent_id FROM category WHERE parent_id = 176 OR id = 176 ORDER BY id;"
        ))
        cats = res.fetchall()
        print("=== Zadoor subcategories (parent=176) ===")
        for c in cats:
            # Count active products
            res2 = await conn.execute(text(
                "SELECT COUNT(*) FROM product WHERE category_id = :cid AND is_active = true;"
            ), {"cid": c[0]})
            count = res2.scalar()
            print(f"  ID={c[0]} | {c[1]} | Active: {count}")
            
            # Check grandchildren
            res3 = await conn.execute(text(
                "SELECT id, name FROM category WHERE parent_id = :pid ORDER BY id;"
            ), {"pid": c[0]})
            grandchildren = res3.fetchall()
            for gc in grandchildren:
                res4 = await conn.execute(text(
                    "SELECT COUNT(*) FROM product WHERE category_id = :cid AND is_active = true;"
                ), {"cid": gc[0]})
                gc_count = res4.scalar()
                print(f"    ID={gc[0]} | {gc[1]} | Active: {gc_count}")

asyncio.run(main())
