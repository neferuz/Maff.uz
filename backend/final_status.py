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
        
        total_with = 0
        total_without = 0
        
        for cat in cats:
            r1 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True"))
            total = r1.scalar()
            r2 = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cat[0]} AND is_active = True AND image_url IS NOT NULL AND image_url != ''"))
            with_photo = r2.scalar()
            no = total - with_photo
            if total > 0:
                total_with += with_photo
                total_without += no
                emoji = "✅" if no == 0 else "⚠️"
                print(f"{emoji} {cat[1]}: {with_photo}/{total} с фото ({no} без)")
        
        print(f"\n📊 ИТОГО: {total_with} с фото, {total_without} без фото")
        
        # Show remaining without photos (real products only)
        cats_str = ",".join(str(c[0]) for c in cats)
        r3 = await conn.execute(text(f"""
            SELECT p.id, p.name, c.name FROM product p 
            JOIN category c ON p.category_id = c.id
            WHERE p.category_id IN ({cats_str}) 
            AND p.is_active = True 
            AND (p.image_url IS NULL OR p.image_url = '')
            AND p.name NOT ILIKE '%каталог%'
            AND p.name NOT ILIKE '%образец%'
            AND p.name NOT ILIKE '%стенд%'
            AND p.name NOT ILIKE '%стэнд%'
            AND p.name NOT ILIKE '%стойк%'
            AND p.name NOT ILIKE '%футболк%'
            AND p.name NOT ILIKE '%карандаш%'
            AND p.name NOT ILIKE '%брелок%'
            AND p.name NOT ILIKE '%брошур%'
            AND p.name NOT ILIKE '%баннер%'
            AND p.name NOT ILIKE '%жилетк%'
            AND p.name NOT ILIKE '%табличк%'
            AND p.name NOT ILIKE '%лента%'
            AND p.name NOT ILIKE '%рекламн%'
            AND p.name NOT ILIKE '%display%'
            AND p.name NOT ILIKE '%set of%'
            AND p.name NOT ILIKE '%decorbook%'
            ORDER BY c.name, p.name
        """))
        missing = r3.fetchall()
        if missing:
            print(f"\n🔴 Настоящие ламинаты БЕЗ фото ({len(missing)}):")
            for m in missing:
                print(f"  ID={m[0]} | {m[2]} | {m[1]}")

asyncio.run(main())
