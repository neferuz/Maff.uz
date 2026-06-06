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
        print("Finding all active laminate products without photos...")
        
        # Query active products under laminate categories (parent_id = 1 or id = 1)
        # where image_url is null or empty.
        query = """
            SELECT id, name, sku, category_id, image_url
            FROM product
            WHERE category_id IN (
                SELECT id FROM category WHERE parent_id = 1 OR id = 1
            )
            AND is_active = True
            AND (image_url IS NULL OR image_url = '')
        """
        res = await conn.execute(text(query))
        rows = res.fetchall()
        
        to_archive = [row.id for row in rows]
        
        if to_archive:
            print(f"Found {len(to_archive)} laminate product(s) without photos to archive:\n")
            for row in rows:
                print(f"  ID={row.id} | SKU={row.sku} | Cat={row.category_id} | '{row.name}'")
                
            print(f"\nArchiving {len(to_archive)} product(s)...")
            archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"
            result = await conn.execute(text(archive_query))
            print(f"Successfully deactivated {result.rowcount} product(s).")
        else:
            print("No active laminate products without photos found.")

if __name__ == "__main__":
    asyncio.run(main())
