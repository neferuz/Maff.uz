import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

def clean_general_handle_name(name: str) -> str:
    if not name:
        return ""
    cleaned = name.lower()
    prefixes = [
        r"^ручка\s+раздельная", r"^ручка\s+поворотная", r"^ручки\s+комплект",
        r"^ручки\s+коплект", r"^ручки\s+с\s+замком\s+без\s+сердечника",
        r"^ручка\s+шариковая", r"^шариковая\s+ручка", r"^ручки", r"^ручка",
        r"^петли\s+бабочка", r"^дверные\s+ограничители", r"^панель", r"^фасад",
    ]
    for pref in prefixes:
        cleaned = re.sub(pref, "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    
    tokens_to_remove = [
        r"д\.ручка", r"вид\s+накладки", r"цилиндр", r"цилинд", r"цилин\.\s*мех",
        r"поворотный", r"поворот", r"с\s+замком", r"с\s+механизмом", r"без\s+сердечника",
        r"и\s+сердцевиной", r"с\s+поворотным\s+механизмом", r"упаковка\s+стандарт",
        r"упаковка", r"стандарт",
    ]
    for token in tokens_to_remove:
        cleaned = re.sub(token, "", cleaned, flags=re.IGNORECASE)
        
    colors_and_finishes = [
        r"\bчёрный\b", r"\bчерный\b", r"\bграфит\b", r"\bбелый\b", r"\bбелая\b",
        r"\bбронза\b", r"\bзолото\b", r"\bхром\b", r"\bсатин\b", r"\bсеребро\b",
        r"\bзолотой\b", r"\bглянец\b", r"\bмат\b", r"\bматовый\b", r"\bантичный\b",
        r"\bникель\b", r"\bсатинированный\b", r"\bчёрная\b", r"\bбежевый\b",
        r"\bnbm-pn/nbm\b", r"\bnbm\b", r"\bbbn\b", r"\bal6\b", r"\bal15\b",
        r"\bgb\b", r"\bgl\b", r"\babm\b", r"\bcbm\b", r"\bcp\b", r"\bsb\b",
        r"\bbl\b", r"\bmsb\b", r"\bfg\b", r"\bmbn\b", r"\bmsn\b", r"\bcp/white-14\b",
        r"\bcp/wh-19\b", r"\bwh-19\b", r"\bbl-24\b", r"\bgr-23\b", r"\bssc-16\b",
        r"\bfsg-39\b", r"\bssg-39\b", r"\bbl-26\b", r"\bcp-8\b", r"\bbk6-1ab/gp-7\b",
        r"\bbk6/urb\b", r"\bbk6-1ab\b", r"\burs52\b", r"\burb2\b", r"\bld80-1ab/gp-7\b",
        r"\bld80\b", r"\bbk6\b", r"\burs\b", r"\burb\b", r"\bblack\b", r"\bgp-7\b",
        r"\b-75\s+5t\s+-\s+black\b", r"\b24к\b", r"\b8\*8\s*mm\b", r"\b8\*8\b",
        r"\b1ab/gp-7\b", r"\b-n\s+bb/bn\b", r"\bbb/bn\b", r"\bbn\b", r"\b\d+х\d+\b",
        r"\b\d+мм\b", r"\b\d+ммм\b", r"\b\(ст\)\b"
    ]
    for col in colors_and_finishes:
        cleaned = re.sub(col, "", cleaned, flags=re.IGNORECASE)
        
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = cleaned.strip().strip(",;-#().")
    
    cleaned = re.sub(r'^agb\b', 'AGB', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'^system\b', 'System', cleaned, flags=re.IGNORECASE)
    
    words = cleaned.split()
    if words:
        words = [w.upper() if re.match(r'^[a-z0-9\-]+$', w) else w.capitalize() for w in words]
        cleaned = " ".join(words)
    return cleaned

def get_handle_base_model_name(name: str) -> str:
    if not name:
        return ""
    
    name_lower = name.lower()
    
    known_models = [
        "pixar l", "axel l", "agate", "mimas", "metis", "concordia", "sarp", "marvel", 
        "akik", "atlas", "aten", "despina", "odin", "zetta", "gamma", "vega", "sinus", 
        "rocca", "prizma", "rodin", "rocket", "spinal", "maja", "carme", "linear", 
        "stark", "jasper", "vision", "libra", "blade tl", "fly sl", "columba", 
        "wave urs", "wave", "stimul", "wc-bolt", "agb 1367", "agb 1593", "agb 1625", 
        "agb 1727", "agb 815", "agb 820", "agb 821", "agb 827", "agb 849", "agb 850", 
        "agb 851", "agb 873", "agb 874", "agb 899", "agb 906", "agb 913", "agb 914", 
        "agb 915", "agb 928", "agb 929", "agb 944", "agb 949", "agb 950", "agb 951", 
        "agb 952", "agb 953", "agb 959", "agb 811", "sx 713", "sx 804", "sx 806",
        "а14-1162", "а32-1771", "а32-1727", "a14-1593", "a32-1625"
    ]
    known_models = sorted(known_models, key=lambda x: -len(x))
    
    for model in known_models:
        pattern = r'\b' + re.escape(model) + r'\b'
        if re.search(pattern, name_lower):
            # Standardize output
            if model in ["pixar l", "axel l", "agate", "mimas", "metis", "concordia", "sarp", 
                         "marvel", "akik", "atlas", "aten", "despina", "odin", "zetta", "gamma", 
                         "vega", "sinus", "rocca", "prizma", "rodin", "rocket", "spinal", "maja", 
                         "carme", "linear", "stark", "jasper", "vision", "libra"]:
                # Capitalize each word (e.g. Pixar L -> Pixar L)
                capitalized_model = " ".join(w.capitalize() for w in model.split())
                return f"System {capitalized_model}"
            elif model.startswith("agb ") or model.startswith("sx "):
                return model.upper()
            else:
                return " ".join(w.capitalize() for w in model.split())
                
    return clean_general_handle_name(name)

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get category 356 children
        res = await session.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        all_cats = {row[0]: (row[1], row[2]) for row in categories}
        
        def get_all_child_ids(cat_id):
            ids = [cat_id]
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    ids.extend(get_all_child_ids(cid))
            return list(set(ids))
            
        handle_cat_ids = get_all_child_ids(356)
        
        res = await session.execute(
            text("SELECT id, name, category_id, image_url, sku FROM product WHERE category_id = ANY(:cat_ids)"),
            {"cat_ids": handle_cat_ids}
        )
        products = res.fetchall()
        
        grouped = {}
        for p in products:
            base = get_handle_base_model_name(p[1])
            grouped.setdefault(base, []).append(p)
            
        print(f"Total handle products: {len(products)}")
        print(f"Total grouped models: {len(grouped)}")
        
        print("\nGrouped handles:")
        for model in sorted(grouped.keys()):
            items = grouped[model]
            print(f"Model: '{model}' ({len(items)} items)")
            for item in items[:3]:
                print(f"  - ID={item[0]} | SKU={item[4]} | Name='{item[1]}'")
            if len(items) > 3:
                print(f"  - ... and {len(items)-3} more")
                
if __name__ == "__main__":
    asyncio.run(main())
