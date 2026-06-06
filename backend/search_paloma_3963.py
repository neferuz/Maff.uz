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
        print("Searching for Paloma 3963 or Бетон Декада...")
        query = """
            SELECT id, name, sku, category_id, image_url, is_active 
            FROM product 
            WHERE name ILIKE '%3963%' OR name ILIKE '%Декада%'
        """
        res = await conn.execute(text(query))
        rows = res.fetchall()
        for r in rows:
            print(f"ID={r.id} | SKU={r.sku} | Cat={r.category_id} | Active={r.is_active} | Name='{r.name}' | Image='{r.image_url}'")

if __name__ == "__main__":
    asyncio.run(main())
