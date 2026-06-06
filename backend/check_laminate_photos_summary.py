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
        cats = res.fetchall()
        
        for cat in cats:
            res2 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True"))
            total = res2.scalar()
            res3 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True AND image_url IS NOT NULL AND image_url != ''"))
            with_photo = res3.scalar()
            no_photo = total - with_photo
            if total > 0:
                print(f"{cat[1]} (cat {cat[0]}): Total={total}, WithPhoto={with_photo}, NoPhoto={no_photo}")

        # Count real products without photo (exclude стенд, образец, каталог, футболка etc.)
        print("\n--- Real laminate products without photos ---")
        res = await conn.execute(text("""
            SELECT id, name, category_id FROM product 
            WHERE category_id IN (SELECT id FROM category WHERE parent_id = 1 OR id = 1)
            AND is_active = True 
            AND (image_url IS NULL OR image_url = '')
            AND name NOT ILIKE '%каталог%'
            AND name NOT ILIKE '%образец%'
            AND name NOT ILIKE '%стенд%'
            AND name NOT ILIKE '%стэнд%'
            AND name NOT ILIKE '%стойк%'
            AND name NOT ILIKE '%футболк%'
            AND name NOT ILIKE '%карандаш%'
            AND name NOT ILIKE '%брелок%'
            AND name NOT ILIKE '%брошур%'
            AND name NOT ILIKE '%баннер%'
            AND name NOT ILIKE '%жилетк%'
            AND name NOT ILIKE '%табличк%'
            AND name NOT ILIKE '%лента%'
            AND name NOT ILIKE '%рекламн%'
            ORDER BY category_id, name
        """))
        real = res.fetchall()
        print(f"Real products without photos: {len(real)}")
        for r in real:
            print(f"  ID={r[0]} | Cat={r[2]} | {r[1]}")

asyncio.run(main())
