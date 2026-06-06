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
        updates = [
            # Fix the 23 rows that were accidentally overwritten
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_12_2_shellac_white.png' WHERE name ILIKE '%Классико-12.1 Флекс Эмаль%'", "Fix 12.1"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_12_2_shellac_white.png' WHERE name ILIKE '%Классико-12.2 Флекс Эмаль%'", "Fix 12.2"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_13_1_resource.jpg' WHERE name ILIKE '%Классико-13.1 Флекс Эмаль%'", "Fix 13.1"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_13_1_shellac_white.jpg' WHERE name ILIKE '%Классико-13.2 Флекс Эмаль%'", "Fix 13.2"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_12_2_shellac_white.png' WHERE name ILIKE '%Карниз Классико Флекс Эмаль Shellac White%'", "Fix Karniz"),
            
            # Apply the new downloaded images safely
            ("UPDATE product SET image_url = '/static/uploads/doors/user_классико-12_пп_alaska.jpg', is_active = true WHERE name ILIKE '%Классико-12 ПП Alaska%'", "Apply 12 Alaska"),
            ("UPDATE product SET image_url = '/static/uploads/doors/user_классико-13_пп_grey_oak_white_crystal.webp', is_active = true WHERE name ILIKE '%Классико-13 ПП Grey Oak White Сrystal%' OR name ILIKE '%Классико-13 ПП Grey Oak White Crystal%'", "Apply 13 Grey Oak White Crystal"),
            ("UPDATE product SET image_url = '/static/uploads/doors/user_классико-13_31_эко_light_sonoma_milling_white_ii.jpg', is_active = true WHERE name ILIKE '%Классико-13.31 ЭКО Light Sonoma Milling White II%'", "Apply 13.31 Light Sonoma")
        ]
        
        for sql, desc in updates:
            print(f"Executing: {desc}")
            result = await conn.execute(text(sql))
            print(f"Updated {result.rowcount} rows")

asyncio.run(main())
