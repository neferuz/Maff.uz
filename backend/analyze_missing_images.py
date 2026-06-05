import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

def clean_handle_name(name):
    # Try to extract base model name
    cleaned = name
    # e.g., "ATEN Д.Ручка Вид накладки Цилинд NBM" -> "ATEN"
    # "Ручка раздельная FLY SL BL-24 чёрный" -> "FLY SL" or "FLY"
    # Let's extract words
    return name

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get category 143 children
        res = await session.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        all_cats = {row[0]: (row[1], row[2]) for row in categories}
        
        def get_all_child_ids(cat_id):
            ids = [cat_id]
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    ids.extend(get_all_child_ids(cid))
            return list(set(ids))
            
        handle_cat_ids = get_all_child_ids(143)
        
        res = await session.execute(
            text("SELECT id, name, category_id, image_url, sku FROM product WHERE category_id = ANY(:cat_ids)"),
            {"cat_ids": handle_cat_ids}
        )
        products = res.fetchall()
        
        no_image = []
        for p in products:
            if not p[3]: # image_url is None or empty
                no_image.append(p)
                
        print(f"Total handles without image: {len(no_image)}")
        
        # Print first 100 or group them to find unique keywords/models
        # Let's group by the first few words or patterns
        groups = {}
        for p in no_image:
            name = p[1]
            # Try to identify potential model
            # Pattern 1: uppercase word at start, e.g. "ATEN Д.Ручка..." -> "ATEN"
            # Pattern 2: "Ручка раздельная MODEL ..." -> "MODEL"
            # Pattern 3: "Ручки AGB MODEL ..." -> "AGB MODEL"
            match_system = re.match(r'^([A-Z0-9\-]+)\s+(?:Д\.Ручка|Ручка)', name)
            match_razd = re.match(r'^Ручка раздельная\s+([A-Za-z0-9\-\.\(\)\s]+?)(?:\s+(?:BL-\d+|GR-\d+|WH-\d+|CP-\d+|GP-|SSG-|8\*8|бронза|золото|хром|чёрный|черный|сатинированный|сатин|серебро|графит|белый|цилин|мех|поворот|комплект|К\.SL|FLY))', name)
            match_agb = re.match(r'^Ручки\s+(AGB\s+\d+|AGB\s+[A-Za-z]+)', name)
            match_agb_compl = re.match(r'^Ручки комплект\s+(AGB\s+\d+|AGB\s+[A-Za-z]+|[A-Z0-9\-]+)', name)
            
            model = None
            if match_system:
                model = match_system.group(1)
            elif match_razd:
                model = match_razd.group(1).strip()
            elif match_agb:
                model = match_agb.group(1)
            elif match_agb_compl:
                model = match_agb_compl.group(1)
            else:
                # Fallback: take first 2 words
                words = name.split()
                model = " ".join(words[:2]) if len(words) >= 2 else name
                
            groups.setdefault(model, []).append(p)
            
        print("\nGrouped handles without image:")
        for model, items in sorted(groups.items(), key=lambda x: -len(x[1])):
            print(f"Model: '{model}' (Count: {len(items)})")
            for item in items[:3]:
                print(f"  - ID={item[0]} | Name='{item[1]}' | SKU={item[4]}")
            if len(items) > 3:
                print(f"  - ... and {len(items)-3} more")

if __name__ == "__main__":
    asyncio.run(main())
