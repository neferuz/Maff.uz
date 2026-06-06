import asyncio
import os
import re
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.product import Product

async def main():
    async with AsyncSessionLocal() as session:
        # Get all Volkhovets photos
        photos_dir = "/Users/apple/Desktop/Maff.uz-main/frontend/public/images/products/volkhovets/"
        try:
            photos = os.listdir(photos_dir)
        except FileNotFoundError:
            print(f"Directory {photos_dir} not found!")
            return

        photos = [p for p in photos if p.endswith(('.png', '.jpg', '.jpeg'))]
        print(f"Found {len(photos)} photos in Volkhovets folder.")

        # Let's read all Volkhovets products from the database
        stmt = select(Product).where(Product.name.ilike('%Полотно дв.%'), Product.brand.ilike('%Волховец%'))
        result = await session.execute(stmt)
        products = result.scalars().all()
        print(f"Found {len(products)} Volkhovets products in DB.")

        updates = 0

        # Mapping heuristic based on matching strings
        for photo in photos:
            # mezhkomnatnaya-dver-antique-7301-mbsk-matovyy-biskvitnyy.png
            # mezhkomnatnaya-dver-charm-6711-bnm-buk-naturalnyy-matovyy.png
            # mezhkomnatnaya-dver-centro-2501-petb-pet-tyeplyy-belyy.png
            
            # Extract model number if exists (e.g. 7301, 6711, 2501)
            model_match = re.search(r'-(\d{4})-', photo)
            model_number = model_match.group(1) if model_match else None
            
            # Basic fallback: keyword matching
            photo_clean = photo.lower().replace('.png', '').replace('.jpg', '').replace('-', ' ')
            
            best_match = None
            best_score = 0
            
            matched_products = []
            
            for p in products:
                score = 0
                name_clean = p.name.lower()
                
                # If the product name contains the model number, huge boost
                if model_number and model_number in name_clean:
                    score += 10
                    
                # Keyword intersection
                photo_words = set(photo_clean.split())
                name_words = set(re.findall(r'[a-zа-я0-9]+', name_clean))
                
                # Check for colors or finishes (transliterated roughly in the filename)
                # Like "buk naturalnyy" -> "бук натуральный"
                if "buk" in photo_clean and "бук" in name_clean: score += 2
                if "naturalnyy" in photo_clean and "натуральный" in name_clean: score += 2
                if "matovyy" in photo_clean and "матовый" in name_clean: score += 2
                if "biskvitnyy" in photo_clean and "бисквит" in name_clean: score += 2
                if "tyeplyy" in photo_clean and "теплый" in name_clean: score += 2
                if "belyy" in photo_clean and "белый" in name_clean: score += 2
                if "pet" in photo_clean and "пэт" in name_clean: score += 2
                if "grafitovyy" in photo_clean and "графит" in name_clean: score += 2
                if "seryy" in photo_clean and "серый" in name_clean: score += 2
                if "kremovo" in photo_clean and "кремово" in name_clean: score += 2
                if "zhemchuzh" in photo_clean and "жемчуг" in name_clean: score += 2
                
                if score > best_score:
                    best_score = score
                    best_match = p
                    matched_products = [p]
                elif score == best_score and score > 0:
                    matched_products.append(p)
                    
            if best_score >= 10:  # Must at least match the model number
                url = f"/images/products/volkhovets/{photo}"
                for mp in matched_products:
                    # Update only if not already having this exact URL
                    if mp.image_url != url:
                        mp.image_url = url
                        updates += 1
                        print(f"[MATCH] {photo} -> {mp.name}")
        
        await session.commit()
        print(f"Updated {updates} Volkhovets products!")

if __name__ == "__main__":
    asyncio.run(main())
