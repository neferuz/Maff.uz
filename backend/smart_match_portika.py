import asyncio
import os
import re
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.product import Product

async def main():
    async with AsyncSessionLocal() as session:
        # Get all Portika photos
        photos_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/"
        try:
            all_photos = os.listdir(photos_dir)
        except FileNotFoundError:
            print(f"Directory {photos_dir} not found!")
            return

        photos = [p for p in all_photos if p.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) and re.search(r'porta|invisible|classico|neoclassico', p, re.IGNORECASE)]
        print(f"Found {len(photos)} photos for Portika.")

        # Let's read all Portika products from the database
        stmt = select(Product).where(
            Product.category_id.in_([426, 427, 428, 429])
        )
        result = await session.execute(stmt)
        products = result.scalars().all()
        print(f"Found {len(products)} Portika products in DB.")

        updates = 0

        # Create mapping heuristic
        for photo in photos:
            photo_clean = photo.lower()
            
            # Extract category / base model
            is_classico = 'classico' in photo_clean and 'neoclassico' not in photo_clean
            is_neoclassico = 'neoclassico' in photo_clean
            is_porta = 'porta' in photo_clean and 'invisible' not in photo_clean
            is_invisible = 'invisible' in photo_clean
            
            # Extract model number if exists (e.g. 12-2, 32, 50, 58)
            model_match = re.search(r'(?:classico|neoclassico|porta)_(\d+(?:_\d+)?)', photo_clean.replace('-', '_'))
            model_number = model_match.group(1).replace('_', '-') if model_match else None
            
            photo_words = set(re.findall(r'[a-zа-я0-9]+', photo_clean.replace('official', '').replace('image', '')))
            
            best_match = None
            best_score = 0
            matched_products = []
            
            for p in products:
                score = 0
                name_clean = p.name.lower()
                
                # Check category match
                if is_classico and p.category_id == 426: score += 5
                elif is_neoclassico and p.category_id == 427: score += 5
                elif is_porta and p.category_id == 428: score += 5
                elif is_invisible and p.category_id == 429: score += 5
                else: continue # Skip if wrong category entirely!
                
                # If the product name contains the model number, huge boost
                if model_number:
                    if model_number in name_clean:
                        score += 10
                    elif model_number.split('-')[0] in name_clean:
                        score += 5
                
                # Colors
                if "alaska" in photo_clean and "alaska" in name_clean: score += 5
                if "shellac" in photo_clean and "shellac" in name_clean: score += 5
                if "nardo" in photo_clean and "nardo grey" in name_clean: score += 5
                if "eco" in photo_clean and "eco ice" in name_clean: score += 5
                if "keramik" in photo_clean and "keramik" in name_clean: score += 5
                if "valse" in photo_clean and "valse" in name_clean: score += 5
                if "brown" in photo_clean and "brown" in name_clean: score += 5
                if "beige" in photo_clean and "beige" in name_clean: score += 5
                if "natural" in photo_clean and "natural oak" in name_clean: score += 5
                if "grey" in photo_clean and "grey oak" in name_clean: score += 5
                if "rocks" in photo_clean and "rocks" in name_clean: score += 5
                if "pearl" in photo_clean and "pearl" in name_clean: score += 5
                if "primer" in photo_clean and "primer" in name_clean: score += 5
                if "praymer" in photo_clean and "primer" in name_clean: score += 5
                
                # Invisible matching
                if is_invisible:
                    if "2000" in photo_clean and "2000" in name_clean: score += 5
                    if "2300" in photo_clean and "2300" in name_clean: score += 5
                    if "4a" in photo_clean and "4a" in name_clean: score += 5
                    if "4ab" in photo_clean and "4ab" in name_clean: score += 5
                
                if score > best_score:
                    best_score = score
                    best_match = p
                    matched_products = [p]
                elif score == best_score and score > 0:
                    matched_products.append(p)
                    
            if best_score >= 10:  # Must have a solid match
                url = f"/static/uploads/doors/{photo}"
                for mp in matched_products:
                    # Update only if not already having this exact URL
                    # Or if the new image is an "official" version, prioritize it
                    if mp.image_url != url:
                        if 'official' in photo_clean or not mp.image_url or 'official' not in mp.image_url.lower():
                            mp.image_url = url
                            updates += 1
                            print(f"[MATCH] {photo} -> {mp.name} (Score: {best_score})")
        
        await session.commit()
        print(f"Updated {updates} Portika products!")

if __name__ == "__main__":
    asyncio.run(main())
