import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Specific laminate product IDs using the door placeholders
target_ids = [68, 74, 69, 72, 75, 70, 71, 73, 76, 78]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Archiving laminate products with door placeholders...")
        query = f"SELECT id, name, sku, image_url FROM product WHERE id IN ({','.join(map(str, target_ids))})"
        res = await conn.execute(text(query))
        rows = res.fetchall()
        
        for r in rows:
            print(f"  Archiving: ID={r.id} | SKU={r.sku} | Name='{r.name}' | Image={r.image_url}")
            
        archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, target_ids))})"
        result = await conn.execute(text(archive_query))
        print(f"\nSuccessfully deactivated {result.rowcount} product(s).")

if __name__ == "__main__":
    asyncio.run(main())
