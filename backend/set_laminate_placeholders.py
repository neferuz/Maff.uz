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
        res = await conn.execute(text("SELECT id, name FROM category WHERE parent_id = 1 OR id = 1"))
        cat_ids = [c[0] for c in res.fetchall()]
        cats_str = ",".join(str(c) for c in cat_ids)
        
        # We only want to set it for real products (not samples)
        res = await conn.execute(text(f"SELECT id, name FROM product WHERE category_id IN ({cats_str}) AND is_active = True AND image_url IS NULL AND name NOT ILIKE '%каталог%' AND name NOT ILIKE '%образец%' AND name NOT ILIKE '%стэнд%' AND name NOT ILIKE '%футболк%' AND name NOT ILIKE '%карандаш%'"))
        products = res.fetchall()
        
        for p in products:
            await conn.execute(text("UPDATE product SET image_url = '/products/laminate-1.png' WHERE id = :id"), {"id": p[0]})
            print(f"Set placeholder for: {p[1]}")
            
        print(f"Successfully updated {len(products)} laminates with placeholder photo.")

asyncio.run(main())
