import asyncio
import json
import os
import glob
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
image_dir = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/zadoor_extracted'
sp_images = sorted([f'/static/uploads/doors/zadoor_extracted/{os.path.basename(f)}' for f in glob.glob(os.path.join(image_dir, '*')) if 'zadoor_sp' in f.lower()])

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # 1. Rename category 355 to "SP"
        await conn.execute(text("UPDATE category SET name = 'SP' WHERE id = 355"))
        print("Renamed category 355 to 'SP'")
        
        # 2. Find all SP doors and components (both with category_id NULL or any of the other SP categories)
        # We will match doors starting with SP51, SP57, SP64, SP66
        # And components containing 'Коробка' or 'Наличник' AND ' SP '
        
        patterns = [
            'SP51 %', 'SP57 %', 'SP64 %', 'SP66 %',
            '%Коробка% SP %', '%Наличник% SP %',
            '% SP Беленый дуб%', '% SP Бетон светлый%', '% SP Бетон темный%',
            '% SP Бренди%', '% SP Нордик%', '% SP Светло-серый%', '% SP Светлый лён%',
            '% SP Сканди%', '% SP Тёмно-серый%', '% SP Тёмный лён%', '% SP Орех карамель%'
        ]
        
        for p in patterns:
            # We want to catch them regardless of whether they have a category or not,
            # but we won't steal from other brands. 
            await conn.execute(
                text("UPDATE product SET category_id = 355 WHERE name LIKE :p AND category_id IS DISTINCT FROM 355"),
                {'p': p}
            )
            
        # 3. Apply distinct images to ALL products in category 355
        res = await conn.execute(text('SELECT id FROM product WHERE category_id = 355'))
        pids = [r[0] for r in res.fetchall()]
        
        if len(sp_images) == 0:
            print("No SP images found!")
            return
            
        for i, pid in enumerate(pids):
            img_url = sp_images[i % len(sp_images)]
            imgs_json = json.dumps(sp_images)
            await conn.execute(
                text('UPDATE product SET image_url = :img_url, images = :imgs_json WHERE id = :id'),
                {'img_url': img_url, 'imgs_json': imgs_json, 'id': pid}
            )
            
        print(f'Fixed category 355 (SP). Total products now: {len(pids)}')

if __name__ == "__main__":
    asyncio.run(main())
