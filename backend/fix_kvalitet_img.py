import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os, re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

IMAGE_MAP = {
    ("К11 ALU Black", "Topan Дуб серый поперечный mb"): "/static/uploads/doors/kvalitet_k11_alu_black_seryy_poperechnyy.jpg",
    ("К11 ALU Black", "Topan Дуб серый продольный mb"): "/static/uploads/doors/kvalitet_k11_alu_black_seryy_poperechnyy.jpg",
    ("К11", "Topan Дуб натуральный поперечный mb"): "/static/uploads/doors/kvalitet_k11_dub_naturalnyy_poperechnyy.jpg",
    ("К11", "Topan Дуб серый поперечный mb"): "/static/uploads/doors/kvalitet_k11_topan_dub_seryy_poperechnyy.jpg",
    ("К11", "Toppan Дуб серый поперечный mb"): "/static/uploads/doors/kvalitet_k11_topan_dub_seryy_poperechnyy.jpg",
    ("К14 ALU Gold", "Графит премьер мат mg"): "/static/uploads/doors/kvalitet_k14_alu_gold_grafit_premer_mat_mg.jpg",
    ("К15 ALU Gold", "Молочный матовый mg"): "/static/uploads/doors/kvalitet_k15_alu_gold_molochnyy_matovyy_mg.jpg",
    ("К2 ALU Black", "Белый матовый Black Lacobel"): "/static/uploads/doors/kvalitet_k2_alu_black_belyy_matovyy_black_lacobel.jpg",
    ("К2 ALU Black", "Toppan Дуб натуральный продольный Black Lacobel"): "/static/uploads/doors/kvalitet_k2_alu_black_dub_naturalnyy_prodolnyy.jpg",
    ("К7", "Белый матовый"): "/static/uploads/doors/kvalitet_k7_belyy_matovyy.jpg",
    ("К7", "Topan Дуб натуральный продольный"): "/static/uploads/doors/kvalitet_k7_dub_naturalnyy_prodolnyy.jpg",
    ("К7", "Topan Дуб серый продольный"): "/static/uploads/doors/kvalitet_k7_dub_seryy_prodolnyy.jpg",
    ("К7", "Topan Дуб тёмный продольный"): "/static/uploads/doors/kvalitet_k7_dub_temnyy_prodolnyy.jpg",
    ("К7", "Toppan Орех Шоколад продольный"): "/static/uploads/doors/kvalitet_k7_orekh_shokolad_prodolnyy.jpg",
}

def normalize(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', text.lower().replace('toppan', 'topan').replace('тёмный', 'темный').strip())

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text(
            "SELECT id, name FROM product "
            "WHERE category_id IN (357, 184, 185, 186, 187, 380, 381, 382) AND is_active = True "
        ))
        products = res.fetchall()
        
        updates = []
        for pid, name in products:
            clean_name = normalize(name)
            clean_name = re.sub(r'\d+\*\d+', '', clean_name).strip()
            clean_name = clean_name.replace("квалитет", "").strip()
            
            matched_img = None
            best_match_len = 0
            
            for (model, color), img in IMAGE_MAP.items():
                norm_model = normalize(model)
                if norm_model in clean_name:
                    norm_color = normalize(color)
                    name_without_model = clean_name.replace(norm_model, "").strip()
                    color_words = set(norm_color.split())
                    name_words = set(name_without_model.split())
                    
                    # Exact match of color words
                    if color_words.issubset(name_words):
                        if len(color_words) > best_match_len:
                            best_match_len = len(color_words)
                            matched_img = img
            
            if matched_img:
                updates.append((matched_img, pid))
                print(f"Updating ID={pid} ({name}) -> {matched_img}")
            else:
                print(f"NO MATCH FOR: {name}")

        for img, pid in updates:
            await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :pid"), {"img": img, "pid": pid})
            
        print(f"Updated {len(updates)} products.")

asyncio.run(main())
