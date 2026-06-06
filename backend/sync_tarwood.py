import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

mappings = [
    ("Аляска", "tarwood-alyaska.webp"),
    ("Арава", "tarwood-arava.webp"),
    ("Балтик", "tarwood-baltik.jpg"),
    ("бронза", "tarwood-bronza.jpg"),
    ("Бурбон", "tarwood-burbon.jpg"),
    ("Экстра Белый", "tarwood-ekstra-belyi.webp"),
    ("Экстра Соло", "tarwood-ekstra-solo.jpg"),
    ("копченый", "tarwood-kopchenyi.jpg"),
    ("корица", "tarwood-koritsa.jpg"),
    ("Корсика", "tarwood-korsika.webp"),
    ("Нежный Песок", "tarwood-nezhnui-pesok.jpg"),
    ("орех", "tarwood-oreh.jpg"),
    ("оригинал", "tarwood-original.jpg"),
    ("Прованс", "tarwood-provans.jpg"),
    ("Сатин", "tarwood-satin.jpg"),
    ("серый винтаж", "tarwood-seryi-vintazh.jpg"),
    ("шелк", "tarwood-shelk.jpg"),
    ("Слоновая кость", "tarwood-slonovaya-kost.jpg"),
    ("слонавая кость", "tarwood-slonovaya-kost.jpg"),  # alternative spelling
    ("старый", "tarwood-staryi.jpg"),
    ("Тавор", "tarwood-tavor.jpg"),
    ("темный шоколад", "tarwood-temnyi-shokolad.jpg"),
    ("жемчуг", "tarwood-zhemchug.jpg"),
    ("Золотой", "tarwood-zolotoy.jpg"),
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name, is_active FROM product WHERE name ILIKE '%Доска паркетная 14мм%' AND name NOT ILIKE '%Образец%'"))
        all_products = res.fetchall()
        
        updated_ids = set()
        
        for search_str, img_file in mappings:
            # find first candidate
            candidate = None
            for p in all_products:
                if search_str.lower() in p[1].lower():
                    # prefer if it's already updated, maybe? No, we just need ONE product per color.
                    # let's pick the one with longest size or something? Or just the first one.
                    candidate = p
                    break
            
            if candidate:
                pid = candidate[0]
                if pid not in updated_ids:
                    print(f"[{search_str}] Match: ID={pid} | {candidate[1]}")
                    await conn.execute(text("""
                        UPDATE product 
                        SET category_id = 112, 
                            is_active = True, 
                            image_url = :img 
                        WHERE id = :id
                    """), {"img": f"/images/products/tarwood/{img_file}", "id": pid})
                    updated_ids.add(pid)
            else:
                print(f"[{search_str}] NO MATCH FOUND!")
                
        # Optional: we should make sure the 6 original Tarwood products remain?
        # The user said "давайте все го товрвы потсаивм и с фоткаим его поставим"
        # We don't touch the original 6, just update these 23.
        
        print(f"\nSuccessfully updated {len(updated_ids)} Tarwood items.")

asyncio.run(main())
