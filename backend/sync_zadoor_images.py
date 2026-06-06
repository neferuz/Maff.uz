import asyncio
import json
import os
import glob
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

image_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/zadoor_extracted"
image_files = glob.glob(os.path.join(image_dir, "*"))

# Collect all images related to Zadoor-S and Neapol
s_images = []
for f in image_files:
    fname = os.path.basename(f).lower()
    if "s-classic" in fname or "zadoor_s" in fname or "zadoor_sp" in fname:
        s_images.append(f"/static/uploads/doors/zadoor_extracted/{os.path.basename(f)}")

s_images.sort()

# Models and components requested by user
target_models = [
    "Неаполь ПГ",
    "Неаполь ПО АК2",
    "Неаполь ПО Английская Классика 2",
    "Неаполь ПО Английская Классика",
    "Неаполь ПО А К"
]

target_complexes = ["Коробка телескопическая", "Наличник телескопический", "Доборный брус"]
target_colors = ["Белый матовый", "Матовый графит", "Графит Премьер Мат", "Графит премьер мат", "Серый матовый", "Матовый кремовый", "Молочный матовый"]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name FROM product"))
        products = res.fetchall()
        
        updated = 0
        for p in products:
            name = p.name
            if not name:
                continue
                
            is_match = False
            
            # Check models
            for model in target_models:
                if model.lower() in name.lower() or model.replace(" ", "") in name.lower().replace(" ", ""):
                    is_match = True
                    break
                    
            # Check complexes
            if not is_match:
                for comp in target_complexes:
                    if comp.lower() in name.lower():
                        for color in target_colors:
                            if color.lower() in name.lower():
                                is_match = True
                                break
                        if is_match:
                            break
                            
            if is_match:
                imgs_json = json.dumps(s_images)
                img_url = s_images[0] if s_images else None
                
                await conn.execute(
                    text("UPDATE product SET image_url = :img_url, images = :imgs_json WHERE id = :id"),
                    {"img_url": img_url, "imgs_json": imgs_json, "id": p.id}
                )
                updated += 1
                
        print(f"Updated images for {updated} Zadoor products and components.")

if __name__ == "__main__":
    asyncio.run(main())
