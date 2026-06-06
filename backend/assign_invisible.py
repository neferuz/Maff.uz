import shutil
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/resources"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

async def main():
    # Copy images
    img1 = "image_2134636351_1.jpg"
    img2 = "image_2134636351_2.jpg"
    
    new_img1 = "porta_invisible_4ab_primer_white_black_1.jpg"
    new_img2 = "porta_invisible_4ab_primer_white_black_2.jpg"
    
    src_path1 = os.path.join(base_dir, img1)
    dst_path1 = os.path.join(out_dir, new_img1)
    
    src_path2 = os.path.join(base_dir, img2)
    dst_path2 = os.path.join(out_dir, new_img2)
    
    if os.path.exists(src_path1): shutil.copy2(src_path1, dst_path1)
    if os.path.exists(src_path2): shutil.copy2(src_path2, dst_path2)
    
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Assign image 1 as the primary image, and maybe both as images array?
        # Actually, let's just use image 1 for all matching variants!
        db_path1 = f"/static/uploads/doors/{new_img1}"
        db_path2 = f"/static/uploads/doors/{new_img2}"
        
        # We match '%Порта Invisible%4AB Праймер White%(Черный: М/B2B)%'
        sql = f"""
        UPDATE product 
        SET image_url = '{db_path1}', images = '["{db_path1}", "{db_path2}"]'
        WHERE name ILIKE '%Порта Invisible%4AB Праймер White%(Черный: М/B2B)%';
        """
        
        result = await conn.execute(text(sql))
        print(f"Updated {result.rowcount} rows with the Invisible door photos!")

asyncio.run(main())
