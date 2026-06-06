import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT name, image_url 
            FROM product 
            WHERE category_id = 426 AND is_active = true
            ORDER BY name;
        """))
        
        products = result.fetchall()
        
        image_to_models = {}
        missing_images = []
        
        for name, image_url in products:
            # Extract base model by removing size (e.g. 2000*800) and ignore "Образец" or "Карниз"
            if 'Образец' in name or 'Карниз' in name:
                continue
                
            base_name = re.sub(r'\s*2000\*\d+', '', name).strip()
            # Clean up trailing commas
            base_name = base_name.rstrip(',')
            
            if not image_url:
                if base_name not in missing_images:
                    missing_images.append(base_name)
                continue
                
            if image_url not in image_to_models:
                image_to_models[image_url] = set()
            image_to_models[image_url].add(base_name)
            
        print("=== ANALYSIS OF REPEATING PHOTOS ===")
        repeats_found = False
        for img, models in image_to_models.items():
            if len(models) > 1:
                repeats_found = True
                print(f"\nWARNING! Image {img} is shared by:")
                for m in models:
                    print(f"  - {m}")
                    
        if not repeats_found:
            print("\nSUCCESS: No different products share the same photo!")
            
        if missing_images:
            print("\n=== PRODUCTS WITH NO PHOTO ===")
            for m in missing_images:
                print(f"  - {m}")
        else:
            print("\nSUCCESS: All active products have a photo!")
            
        print("\n=== FULL LIST OF MODELS AND THEIR PHOTOS ===")
        for img, models in image_to_models.items():
            for m in models:
                print(f"{m}  -->  {img.split('/')[-1]}")

asyncio.run(main())
