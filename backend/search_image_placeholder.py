import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

target_image = "4luduzxj155pp1ut0vbue628mb3dxxow.jpg"

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print(f"Searching for products with image containing: '{target_image}'...")
        query = """
            SELECT id, name, sku, category_id, image_url, is_active 
            FROM product 
            WHERE image_url LIKE :img
        """
        res = await conn.execute(text(query), {"img": f"%{target_image}%"})
        rows = res.fetchall()
        
        if rows:
            print(f"Found {len(rows)} product(s):")
            for r in rows:
                print(f"  ID={r.id} | SKU={r.sku} | Cat={r.category_id} | Active={r.is_active} | '{r.name}' | Image={r.image_url}")
        else:
            print("No products found with this image.")

if __name__ == "__main__":
    asyncio.run(main())
