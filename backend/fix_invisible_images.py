import shutil
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

mappings = {
    "image_2134636351_1.jpg": "Порта Invisible 4AB Праймер White (Черный: М/B2B) *2000",
    "image_2134636351_2.jpg": "Порта Invisible 4AB Праймер White (Черный: М/B2B) *2300"
}

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/resources"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for img_name, product_name in mappings.items():
            # Use '2000' or '2300' to differentiate the filenames safely
            size_part = "2000" if "2000" in product_name else "2300"
            new_filename = f"porta_invisible_4ab_primer_white_black_{size_part}.jpg"
            
            src_path = os.path.join(base_dir, img_name)
            dst_path = os.path.join(out_dir, new_filename)
            
            if os.path.exists(src_path):
                shutil.copy2(src_path, dst_path)
                
                db_path = f"/static/uploads/doors/{new_filename}"
                # We can match exactly because the user provided the exact text
                sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%Порта Invisible 4AB Праймер White (Черный: М/B2B)%{size_part}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Invisible%');"
                
                result = await conn.execute(text(sql))
                print(f"Updated {result.rowcount} rows for {size_part}")

asyncio.run(main())
