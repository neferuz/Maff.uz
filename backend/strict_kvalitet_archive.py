import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os, re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

IMAGE_MAP = {
    ("К11 ALU Black", "Topan Дуб серый поперечный mb"),
    ("К11 ALU Black", "Topan Дуб серый продольный mb"),
    ("К11", "Topan Дуб натуральный поперечный mb"),
    ("К11", "Topan Дуб серый поперечный mb"),
    ("К11", "Toppan Дуб серый поперечный mb"),
    ("К14 ALU Gold", "Графит премьер мат mg"),
    ("К15 ALU Gold", "Молочный матовый mg"),
    ("К2 ALU Black", "Белый матовый Black Lacobel"),
    ("К2 ALU Black", "Toppan Дуб натуральный продольный Black Lacobel"),
    ("К7", "Белый матовый"),
    ("К7", "Topan Дуб натуральный продольный"),
    ("К7", "Topan Дуб серый продольный"),
    ("К7", "Topan Дуб тёмный продольный"),
    ("К7", "Toppan Орех Шоколад продольный"),
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
        
        to_archive = []
        valid_ids = []
        
        for pid, name in products:
            clean_name = normalize(name)
            clean_name = re.sub(r'\d+\*\d+', '', clean_name).strip()
            clean_name = clean_name.replace("квалитет", "").strip()
            
            # Immediately archive "стенд" and "образец" and "без врезки"
            if "стенд" in clean_name or "образец" in clean_name or "без врезки" in clean_name:
                to_archive.append(pid)
                continue
                
            is_valid = False
            for (model, color) in IMAGE_MAP:
                norm_model = normalize(model)
                if norm_model in clean_name:
                    norm_color = normalize(color)
                    name_without_model = clean_name.replace(norm_model, "").strip()
                    color_words = set(norm_color.split())
                    name_words = set(name_without_model.split())
                    
                    if color_words.issubset(name_words):
                        is_valid = True
                        break
                        
            if is_valid:
                valid_ids.append(pid)
                print(f"Keeping Active: {name}")
            else:
                to_archive.append(pid)

        if to_archive:
            print(f"Archiving {len(to_archive)} products...")
            await conn.execute(text(f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"))
        
        print(f"Total valid active items remaining: {len(valid_ids)}")

asyncio.run(main())
