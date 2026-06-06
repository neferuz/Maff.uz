import asyncio
import os
import re
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

KNOWN_COLORS = [
    "Белый матовый", "Серый матовый", "Матовый графит", "Матовый кремовый", "Нордик",
    "Орех карамель", "Жемчужно-перламутровый", "Беленый дуб", "Дуб темный", "Дуб темный продольный",
    "Дуб натуральный", "Дуб натуральный продольный", "Alaska", "Grey Oak", "Natural Oak", "White Oak",
    "Молочный матовый", "Графит премьер мат", "Тёмный лён", "Бетон светлый", "Светлый лён", "Сканди",
    "Бетон тёмный", "Бренди", "Светло-серый", "Оливковый", "Белая эмаль", "Бежевый", "Мелон", "Милано",
    "Венге", "Итальянский орех", "Жасмин белый", "Белый шелку", "Белый шелк", "Тёмно-серый", "Кофе",
    "Антрацит", "Хром", "Черный", "Черный лакобель", "Ламинатин Белый", "Keramik Beige", "Keramik Brown",
    "Ice", "Милквуд", "Опал", "Айвори", "Стоун", "Дэним", "Шэдоу", "Белый", "Серый", "Кремовый",
    "Меланж", "Светлый кунжут", "Темный кунжут", "Песочный матовый", "Дарквуд", "Дарк Вуд", "Грунт",
    "Без врезки"
]

def parse_product_name(name: str):
    if not name:
        return {"model": "", "color": "", "glass": ""}
    
    color = ""
    for known in KNOWN_COLORS:
        # Avoid partial matches: only match word boundaries or end of string
        pattern = r"(?i)\b" + re.escape(known) + r"(?:\b|$)"
        if re.search(pattern, name):
            color = known
            break
    
    glass = ""
    if " ПГ" in name or "ПГ " in name or name.endswith("ПГ"):
        glass = "ПГ"
    elif " ПО" in name or "ПО " in name or name.endswith("ПО"):
        glass = "ПО"
        
    model = ""
    lower_name = name.lower()
    if "неаполь" in lower_name: model = "Неаполь"
    elif "турин" in lower_name: model = "Турин"
    elif "венеция" in lower_name: model = "Венеция"
    elif "ампир" in lower_name: model = "Ампир"
    elif "классико" in lower_name: model = "Классико"
    elif "порта" in lower_name: model = "Порта"
    
    return {"model": model, "color": color, "glass": glass}

def parse_filename(f: str):
    f_lower = f.lower()
    model = ""
    if "neapol" in f_lower or "неаполь" in f_lower: model = "Неаполь"
    elif "turin" in f_lower or "турин" in f_lower: model = "Турин"
    elif "venezia" in f_lower or "венеция" in f_lower: model = "Венеция"
    elif "ampir" in f_lower or "ампир" in f_lower: model = "Ампир"
    elif "classico" in f_lower or "классико" in f_lower: model = "Классико"
    elif "porta" in f_lower or "порта" in f_lower: model = "Порта"
    
    glass = ""
    if "_pg_" in f_lower or "_пг_" in f_lower: glass = "ПГ"
    elif "_po_" in f_lower or "_по_" in f_lower: glass = "ПО"
    
    # Extract color from filename
    color = ""
    if "grafit_premer_mat" in f_lower or "графит_премьер_мат" in f_lower: color = "Графит премьер мат"
    elif "beliy_matoviy" in f_lower or "белый_матовый" in f_lower: color = "Белый матовый"
    elif "sery_matoviy" in f_lower or "серый_матовый" in f_lower: color = "Серый матовый"
    elif "matoviy_grafit" in f_lower or "матовый_графит" in f_lower: color = "Матовый графит"
    elif "zhemchuzhno_perlamutroviy" in f_lower or "жемчужно_перламутровый" in f_lower or "жемчуг" in f_lower or "перламутр" in f_lower: color = "Жемчужно-перламутровый"
    elif "alaska" in f_lower or "аляска" in f_lower: color = "Alaska"
    elif "ice" in f_lower: color = "Ice"
    elif "kremoviy" in f_lower or "кремовый" in f_lower: color = "Кремовый"
    elif "beliy" in f_lower or "белый" in f_lower: color = "Белый"
    elif "sery" in f_lower or "серый" in f_lower: color = "Серый"
    elif "grafit" in f_lower or "графит" in f_lower: color = "Матовый графит" # Default fallback for grafit
    elif "nardo" in f_lower and "grey" in f_lower: color = "Nardo Grey" # Need to add to KNOWN if it exists?
        
    # If just "grafit" is in filename and not matched above
    if not color and ("grafit" in f_lower or "графит" in f_lower):
        color = "Матовый графит"
        
    return {"model": model, "color": color, "glass": glass}

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(text("SELECT id, name FROM product WHERE is_active = True"))
        products = res.fetchall()
        
        # Pre-parse all products
        parsed_products = []
        for p in products:
            parsed = parse_product_name(p[1])
            if parsed["model"]:
                parsed_products.append({"id": p[0], "name": p[1], "parsed": parsed})
                
        files = os.listdir("static/uploads/doors")
        files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        matched_count = 0
        total_products_matched = 0
        
        for f in files:
            f_parsed = parse_filename(f)
            if not f_parsed["model"]:
                continue
                
            # Find matching products
            matches = []
            for p in parsed_products:
                if p["parsed"]["model"] != f_parsed["model"]: continue
                if f_parsed["glass"] and p["parsed"]["glass"] and p["parsed"]["glass"] != f_parsed["glass"]: continue
                
                # Strict color matching
                if f_parsed["color"]:
                    if p["parsed"]["color"] == f_parsed["color"]:
                        matches.append(p)
                    # Special cases for loose matching if color wasn't perfectly extracted
                    elif f_parsed["color"] == "Белый" and p["parsed"]["color"] == "Белый матовый":
                        # Usually "beliy" without "matoviy" should ONLY match "Белый"
                        pass
                else:
                    # If filename doesn't have a known color, we can't safely match multiple.
                    # Unless it's the only one for the model.
                    pass
            
            if matches:
                print(f"[MATCH] {f} -> {len(matches)} products (Model: {f_parsed['model']}, Color: {f_parsed['color']})")
                matched_count += 1
                total_products_matched += len(matches)
                
                # UPDATE!
                image_url = f"/static/uploads/doors/{f}"
                ids = [str(m["id"]) for m in matches]
                if ids:
                    ids_str = ",".join(ids)
                    await session.execute(text(f"UPDATE product SET image_url = :image_url WHERE id IN ({ids_str})"), {"image_url": image_url})
            else:
                pass
                
        await session.commit()
        print(f"\nSummary: {matched_count} images matched {total_products_matched} products.")

if __name__ == "__main__":
    asyncio.run(main())
