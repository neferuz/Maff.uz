import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

placeholders = ["l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg", "0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg"]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for placeholder in placeholders:
            print(f"\nSearching for products with image: '{placeholder}'...")
            query = """
                SELECT id, name, sku, category_id, image_url, is_active 
                FROM product 
                WHERE image_url LIKE :img
            """
            res = await conn.execute(text(query), {"img": f"%{placeholder}%"})
            rows = res.fetchall()
            
            if rows:
                print(f"Found {len(rows)} product(s):")
                for r in rows:
                    print(f"  ID={r.id} | SKU={r.sku} | Cat={r.category_id} | Active={r.is_active} | '{r.name}' | Image={r.image_url}")
            else:
                print("No products found with this image.")

if __name__ == "__main__":
    asyncio.run(main())
