import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os, re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

VALID_ITEMS = {
    "К11 ALU Black": [
        "Topan Дуб серый поперечный mb",
        "Topan Дуб серый продольный mb"
    ],
    "К11": [
        "Topan Дуб натуральный поперечный mb",
        "Topan Дуб серый поперечный mb",
        "Toppan Дуб серый поперечный mb"
    ],
    "К14 ALU Gold": [
        "Графит премьер мат mg"
    ],
    "К15 ALU Gold": [
        "Молочный матовый mg"
    ],
    "К2 ALU Black": [
        "Белый матовый Black Lacobel",
        "Toppan Дуб натуральный продольный Black Lacobel"
    ],
    "К7": [
        "Белый матовый",
        "Topan Дуб натуральный продольный",
        "Topan Дуб серый продольный",
        "Topan Дуб тёмный продольный",
        "Toppan Орех Шоколад продольный"
    ]
}

def normalize(text):
    if not text: return ""
    return re.sub(r'\s+', ' ', text.lower().replace('toppan', 'topan').strip())

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text(
            "SELECT id, name, category_id, is_active FROM product "
            "WHERE category_id IN (357, 184, 185, 186, 187, 380, 381, 382) "
            "ORDER BY name;"
        ))
        products = res.fetchall()
        
        to_archive = []
        valid_ids = []
        
        for pid, name, cat, active in products:
            clean_name = normalize(name)
            clean_name = re.sub(r'\d+\*\d+', '', clean_name).strip()
            clean_name = clean_name.replace("квалитет", "").strip()
            
            is_valid = False
            for model, colors in VALID_ITEMS.items():
                norm_model = normalize(model)
                if norm_model in clean_name:
                    for color in colors:
                        norm_color = normalize(color)
                        name_without_model = clean_name.replace(norm_model, "").strip()
                        color_words = set(norm_color.split())
                        name_words = set(name_without_model.split())
                        
                        if len(color_words & name_words) >= min(2, len(color_words)):
                            is_valid = True
                            break
                if is_valid: break
            
            if is_valid:
                valid_ids.append(pid)
            elif active:
                to_archive.append(pid)

        # Execute updates
        if to_archive:
            print(f"Archiving {len(to_archive)} items...")
            await conn.execute(text(f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"))
        
        print(f"Kept {len(valid_ids)} items active.")

asyncio.run(main())
