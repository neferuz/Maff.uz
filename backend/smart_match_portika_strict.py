import asyncio
import os
import re
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.product import Product

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Product).where(Product.category_id.in_([426, 427, 428, 429]))
        result = await session.execute(stmt)
        products = result.scalars().all()
            
        photos_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/"
        all_photos = os.listdir(photos_dir)
        photos = [p for p in all_photos if p.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) and re.search(r'porta|invisible|classico|neoclassico', p, re.IGNORECASE)]
        
        photos.sort(key=lambda x: 0 if 'official' in x.lower() else 1)
        
        updates = 0
        
        color_map = {
            "alaska_white_crystal": ["alaska", "crystal"],
            "nardo_grey_white_crystal": ["nardo", "crystal"],
            "eco_ice_milling": ["эко", "ice", "milling"],
            "alaska": ["alaska"],
            "shellac": ["shellac"],
            "nardo": ["nardo"],
            "eco": ["эко", "ice"],  # CYRILLIC ЭКО
            "keramik_beige": ["keramik", "beige"],
            "keramik_brown": ["keramik", "brown"],
            "keramik_valse": ["keramik", "valse"],
            "natural_oak": ["natural"],
            "grey_oak": ["grey", "oak"],
            "rocks_beige": ["rocks", "beige"],
            "rocks_pearl": ["rocks", "pearl"],
            "primer": ["primer"],
            "praymer": ["praymer"],
        }
        
        for photo in photos:
            photo_clean = photo.lower()
            is_classico = 'classico' in photo_clean and 'neoclassico' not in photo_clean
            is_neoclassico = 'neoclassico' in photo_clean
            is_porta = 'porta' in photo_clean and 'invisible' not in photo_clean
            is_invisible = 'invisible' in photo_clean
            
            model_match = re.search(r'(?:classico|neoclassico|porta)_(\d+(?:_\d+)?)', photo_clean.replace('-', '_'))
            model_number = model_match.group(1).replace('_', '-') if model_match else None
            if is_invisible:
                if '4ab' in photo_clean: model_number = '4ab'
                elif '4a' in photo_clean: model_number = '4a'
            
            photo_colors = []
            for color_key, keywords in color_map.items():
                if color_key in photo_clean or (color_key == 'eco' and 'eco' in photo_clean) or (color_key == 'eco_ice_milling' and 'eco' in photo_clean and 'milling' in photo_clean):
                    photo_colors.append(color_key)
            
            best_match = None
            best_score = 0
            matched_products = []
            
            for p in products:
                score = 0
                name_clean = p.name.lower()
                
                if is_classico and p.category_id == 426: score += 5
                elif is_neoclassico and p.category_id == 427: score += 5
                elif is_porta and p.category_id == 428: score += 5
                elif is_invisible and p.category_id == 429: score += 5
                else: continue
                
                if model_number:
                    if model_number in name_clean:
                        score += 10
                    elif model_number.split('-')[0] in name_clean:
                        score += 5
                
                color_matched = False
                for color_key in photo_colors:
                    keywords = color_map[color_key]
                    if all(kw in name_clean for kw in keywords):
                        score += 10
                        color_matched = True
                        break
                        
                if not color_matched and len(photo_colors) > 0:
                    score -= 20
                
                if is_invisible:
                    if "2000" in photo_clean and "2000" in name_clean: score += 5
                    if "2300" in photo_clean and "2300" in name_clean: score += 5
                
                if score > best_score:
                    best_score = score
                    matched_products = [p]
                elif score == best_score and score > 0:
                    matched_products.append(p)
                    
            if best_score >= 15:
                url = f"/static/uploads/doors/{photo}"
                for mp in matched_products:
                    if mp.image_url != url:
                        mp.image_url = url
                        updates += 1
                        print(f"[MATCH] {photo} -> {mp.name} (Score: {best_score})")
        
        await session.commit()
        print(f"Updated {updates} Portika products!")

if __name__ == "__main__":
    asyncio.run(main())
