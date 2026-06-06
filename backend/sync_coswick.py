import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

MAPPINGS = [
    ("Миндальный", "Паркетная доска Coswick Английская елка 90 Дуб Миндальный", "/static/uploads/coswick/coswick_mindalniy.png"),
    ("Пастель рустикальная", "Паркетная доска Coswick Английская елка 90 Дуб Пастель рустикальная", "/static/uploads/coswick/coswick_pastel_rustikalnaya.png"),
    ("Сиена натуральная", "Паркетная доска Coswick Дуб Сиена натуральная", "/static/uploads/coswick/coswick_siena_naturalnaya.png"),
    ("Титановый буфф", "Паркетная доска Coswick Французская елка 45 Дуб Титановый буфф", "/static/uploads/coswick/coswick_titanoviy_buff.png"),
    ("Кедр", "Паркетная доска Coswick Английская елка 90 Дуб Кедр", "/static/uploads/coswick/coswick_kedr.png"),
    ("Молочный Шоколад", "Паркетная доска Coswick Английская елка 90 Дуб Молочный Шоколад", "/static/uploads/coswick/coswick_molochniy_shokolad.png"),
    ("Каменный Ручей", "Паркетная доска Coswick Французская елка 60 Дуб Каменный Ручей", "/static/uploads/coswick/coswick_kamenniy_ruchey.png"),
    ("Соломенный", "Паркетная доска Coswick Французская елка 60 Дуб Соломенный", "/static/uploads/coswick/coswick_solomenniy.png"),
    ("Натуральный", "Паркетная доска Coswick Дуб Натуральный", "/static/uploads/coswick/coswick_naturalniy.png"),
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name FROM product WHERE category_id = 406"))
        all_products = res.fetchall()
        
        selected_ids = []
        
        for search_color, new_name, img_url in MAPPINGS:
            # find candidates
            candidates = []
            for p in all_products:
                if search_color.lower() in p[1].lower():
                    # prevent 'Сиена натуральная' matching 'Натуральный'
                    if search_color == "Натуральный" and "Сиена" in p[1]:
                        continue
                    candidates.append(p)
            
            # prefer 'Паркет' over 'Щит'
            best_candidate = None
            for c in candidates:
                if "Паркет" in c[1] and "Щит" not in c[1] and "Образец" not in c[1]:
                    best_candidate = c
                    break
            
            if not best_candidate and candidates:
                best_candidate = candidates[0]
                
            if best_candidate:
                print(f"[{search_color}] Found: ID={best_candidate[0]} | {best_candidate[1]}")
                selected_ids.append(best_candidate[0])
                await conn.execute(text("UPDATE product SET name = :name, image_url = :img, is_active = True WHERE id = :id"), {"name": new_name, "img": img_url, "id": best_candidate[0]})
            else:
                print(f"[{search_color}] NOT FOUND!")
                
        # archive all other products in category 406
        if selected_ids:
            placeholders = ",".join(map(str, selected_ids))
            await conn.execute(text(f"UPDATE product SET is_active = False WHERE category_id = 406 AND id NOT IN ({placeholders})"))
            print(f"\nArchived all other Coswick products except the {len(selected_ids)} matched ones.")

asyncio.run(main())
