import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

def clean_general_handle_name(name: str) -> str:
    if not name:
        return ""
    
    # Lowercase
    cleaned = name.lower()
    
    # Strip some standard prefix terms
    prefixes = [
        r"^ручка\s+раздельная",
        r"^ручка\s+поворотная",
        r"^ручки\s+комплект",
        r"^ручки\s+коплект",
        r"^ручки\s+с\s+замком\s+без\s+сердечника",
        r"^ручка\s+шариковая",
        r"^шариковая\s+ручка",
        r"^ручки",
        r"^ручка",
        r"^петли\s+бабочка",
        r"^дверные\s+ограничители",
        r"^панель",
        r"^фасад",
    ]
    for pref in prefixes:
        cleaned = re.sub(pref, "", cleaned, flags=re.IGNORECASE)
        
    cleaned = cleaned.strip()
    
    # Suffix/middle terms
    tokens_to_remove = [
        r"д\.ручка",
        r"вид\s+накладки",
        r"цилиндр",
        r"цилинд",
        r"цилин\.\s*мех",
        r"поворотный",
        r"поворот",
        r"с\s+замком",
        r"с\s+механизмом",
        r"без\s+сердечника",
        r"и\s+сердцевиной",
        r"с\s+поворотным\s+механизмом",
        r"упаковка\s+стандарт",
        r"упаковка",
        r"стандарт",
    ]
    for token in tokens_to_remove:
        cleaned = re.sub(token, "", cleaned, flags=re.IGNORECASE)
        
    # Colors and finish codes
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
    
    # Capitalize model numbers/names
    # AGB models
    cleaned = re.sub(r'^agb\b', 'AGB', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'^system\b', 'System', cleaned, flags=re.IGNORECASE)
    
    words = cleaned.split()
    if words:
        words = [w.upper() if re.match(r'^[a-z0-9\-]+$', w) else w.capitalize() for w in words]
        cleaned = " ".join(words)
        
    return cleaned

def get_handle_base_model_name(name: str, category_name: str) -> str:
    if category_name:
        if category_name.startswith("Дверные ручки System "):
            model = category_name.replace("Дверные ручки System ", "").strip()
            return f"System {model}"
        elif category_name == "ATLAS":
            return "System Atlas"
        elif category_name == "ATEN":
            return "System Aten"
            
    # Fallback to regex cleaning
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
            cat_name = all_cats[p[2]][0] if p[2] in all_cats else None
            base = get_handle_base_model_name(p[1], cat_name)
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
