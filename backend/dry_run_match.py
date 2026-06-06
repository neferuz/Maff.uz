import asyncio
import os
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

MAPPING = {
    'neapol': ['Неаполь'],
    'venezia': ['Венеция'],
    'turin': ['Турин'],
    'ampir': ['Ампир'],
    'classico': ['Classico'],
    'neoclassico': ['Neoclassico'],
    'kvalitet': ['Квалитет'],
    'porta': ['Porta'],
    'invisible': ['Invisible'],
    'art_lite': ['Art-Lite', 'Art Lite'],
    'pg': ['ПГ', 'PG'],
    'po': ['ПО', 'PO'],
    'b1': ['В1', 'B1'],
    'b2': ['В2', 'B2'],
    'b3': ['В3', 'B3'],
    'b4': ['В4', 'B4'],
    'b5': ['В5', 'B5'],
    'b53': ['В53', 'B53'],
    'beliy': ['белы', 'white'],
    'white': ['белы', 'white'],
    'kremoviy': ['кремов', 'cream'],
    'cream': ['кремов', 'cream'],
    'sery': ['серы', 'grey', 'gray'],
    'grey': ['серы', 'grey', 'gray'],
    'grafit': ['графит', 'grafit'],
    'alaska': ['alaska', 'аляска'],
    'pearl': ['pearl', 'жемчуг'],
    'eco': ['eco'],
    'ice': ['ice'],
    'nardo': ['nardo'],
    'shellac': ['shellac'],
    'keramik': ['keramik'],
    'brown': ['brown'],
    'valse': ['valse'],
    'chaos': ['chaos'],
    'ral': ['ral'],
    'black': ['black', 'черн'],
    'lakobel': ['lakobel', 'лакобель'],
}

def parse_filename_to_conditions(filename):
    name_without_ext = os.path.splitext(filename)[0]
    parts = re.split(r'[_\-\s]+', name_without_ext.lower())
    
    conditions = []
    ignored = ['official', 'cb', 'image', 'new', 'lite', 'classic', 'baguette', 'polotno', 'dver']
    
    for p in parts:
        if p in ignored or p.isdigit() or len(p) <= 1 and p not in ['a','b']:
            continue
            
        mapped = MAPPING.get(p, [p])
        conditions.append(mapped)
        
    return conditions

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    img_dir = "static/uploads/doors"
    if not os.path.exists(img_dir):
        print(f"Directory {img_dir} does not exist.")
        return
        
    filenames = os.listdir(img_dir)
    print(f"Found {len(filenames)} files. Dry-running matches...")
    
    matched_count = 0
    total_products_matched = 0
    
    async with async_session() as session:
        for f in filenames:
            if not f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue
                
            conds = parse_filename_to_conditions(f)
            if not conds:
                continue
                
            query_parts = []
            params = {}
            for i, c_list in enumerate(conds):
                or_parts = []
                for j, keyword in enumerate(c_list):
                    param_name = f"kw_{i}_{j}"
                    or_parts.append(f"name ILIKE :{param_name}")
                    params[param_name] = f"%{keyword}%"
                query_parts.append(f"({' OR '.join(or_parts)})")
                
            query_str = f"SELECT id, name FROM product WHERE {' AND '.join(query_parts)} AND is_active = True"
            
            res = await session.execute(text(query_str), params)
            products = res.fetchall()
            
            if products:
                matched_count += 1
                total_products_matched += len(products)
                print(f"[MATCHED {len(products)} products] {f} -> {conds}")
                image_url = f"/static/uploads/doors/{f}"
                update_query = f"UPDATE product SET image_url = :image_url WHERE {" AND ".join(query_parts)} AND is_active = True"
                params["image_url"] = image_url
                await session.execute(text(update_query), params)
            else:
                print(f"[NO MATCH] {f} -> {conds}")
                
        await session.commit()
        
    print(f"\\nSummary: {matched_count} images matched a total of {total_products_matched} products.")

if __name__ == "__main__":
    asyncio.run(main())
