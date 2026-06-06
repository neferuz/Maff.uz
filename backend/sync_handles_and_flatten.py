import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

model_images = {
    "agate": ("/static/uploads/handles/agate_nbm_pn_nbm.jpg", ["nbm"]),
    "akik": ("/static/uploads/handles/akik_nbm.jpg", ["nbm"]),
    "aten": ("/static/uploads/handles/aten_nbm.jpg", ["nbm"]),
    "atlas": ("/static/uploads/handles/atlas_bbn.jpg", ["bbn"]),
    "axel-l": ("/static/uploads/handles/axel_l_al6.jpg", ["al6"]),
    "axel l": ("/static/uploads/handles/axel_l_al6.jpg", ["al6"]),
    "bolivar": ("/static/uploads/handles/bolivar_cbm.webp", ["cbm"]),
    "carme": ("/static/uploads/handles/carme_bbn.jpg", ["bbn"]),
    "concordia": ("/static/uploads/handles/concordia_bbn.jpg", ["bbn"]),
    "flow": ("/static/uploads/handles/flow_dm_ssg39.jpg", ["ssg39", "ssg"]),
    "gamma": ("/static/uploads/handles/gamma_al15.jpg", ["al15"]),
    "maja": ("/static/uploads/handles/maja_nbm.jpg", ["nbm"]),
    "marvel": ("/static/uploads/handles/marvel_nbm.jpg", ["nbm"]),
    "pixar-l": ("/static/uploads/handles/pixar_l_abm.jpg", ["abm"]),
    "pixar l": ("/static/uploads/handles/pixar_l_abm.jpg", ["abm"]),
    "prizma": ("/static/uploads/handles/prizma_gb.jpg", ["gb"]),
    "rocca": ("/static/uploads/handles/rocca_gl.jpg", ["gl"]),
    "rocket": ("/static/uploads/handles/rocket_nbm.jpg", ["nbm"]),
    "rodin": ("/static/uploads/handles/rodin_abm.jpg", ["abm"]),
    "sarp": ("/static/uploads/handles/sarp_nbm.jpg", ["nbm"]),
    "spinal": ("/static/uploads/handles/spinal_nbm.jpg", ["nbm"]),
    "vision": ("/static/uploads/handles/vision_nbm.jpg", ["nbm"]),
}

def get_base_model(name):
    name_lower = name.lower()
    for m in model_images.keys():
        m_clean = m.replace('-', r'[\s-]?').replace(' ', r'[\s-]?')
        pattern = r'\b' + m_clean + r'\b'
        if re.search(pattern, name_lower):
            return m
    return None

def color_matches(name, sku, allowed_colors):
    combined = (name + " " + (sku or "")).lower()
    for color in allowed_colors:
        pattern = r'\b' + re.escape(color) + r'\b'
        if re.search(pattern, combined):
            return True
        if color in combined:
            return True
    return False

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # 1. Retrieve the category tree
        res = await conn.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        all_cats = {row.id: (row.name, row.parent_id) for row in categories}
        
        def get_all_descendants(cat_id):
            desc = []
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    desc.append(cid)
                    desc.extend(get_all_descendants(cid))
            return list(set(desc))
            
        descendant_cats = get_all_descendants(356)
        print(f"Found {len(descendant_cats)} descendant category IDs under 'Ручки' (356): {descendant_cats}")
        
        # 2. Move all products in descendant categories directly to category 356
        if descendant_cats:
            move_res = await conn.execute(text(f"""
                UPDATE product 
                SET category_id = 356 
                WHERE category_id IN ({','.join(map(str, descendant_cats))})
            """))
            print(f"Moved {move_res.rowcount} products to the parent category 'Ручки' (356).")
            
            # 3. Deactivate all descendant categories
            deactivate_res = await conn.execute(text(f"""
                UPDATE category 
                SET is_active = False 
                WHERE id IN ({','.join(map(str, descendant_cats))})
            """))
            print(f"Deactivated {deactivate_res.rowcount} subcategories of 'Ручки'.")
        else:
            print("No descendant categories found to process.")
            
        # 4. Get all products currently in category 356
        res_prods = await conn.execute(text("SELECT id, name, sku, image_url, is_active FROM product WHERE category_id = 356"))
        products = res_prods.fetchall()
        print(f"Found {len(products)} total products under category 356.")
        
        updated_count = 0
        archived_count = 0
        
        for p in products:
            name_lower = p.name.lower()
            is_turn_button = any(k in name_lower for k in ["поворот", "wc-bolt", "wc_bolt", "толчок", "накладка поворот"])
            
            if is_turn_button:
                await conn.execute(
                    text("UPDATE product SET is_active = False WHERE id = :id"),
                    {"id": p.id}
                )
                archived_count += 1
                print(f"ARCHIVE (WC Bolt): '{p.name}'")
                continue
                
            base_model = get_base_model(p.name)
            
            if base_model:
                allowed_colors = model_images[base_model][1]
                if color_matches(p.name, p.sku, allowed_colors):
                    # Corresponding model is matched AND color matches
                    img_url = model_images[base_model][0]
                    
                    await conn.execute(
                        text("UPDATE product SET image_url = :img, is_active = True WHERE id = :id"),
                        {"img": img_url, "id": p.id}
                    )
                    updated_count += 1
                    print(f"ASSIGN IMAGE & KEEP ACTIVE: '{p.name}' ==> '{img_url}'")
                    continue
            
            # If not matched or mismatched color, deactivate/archive it
            await conn.execute(
                text("UPDATE product SET is_active = False WHERE id = :id"),
                {"id": p.id}
            )
            archived_count += 1
            print(f"ARCHIVE: '{p.name}' (No model photo or mismatched color)")
                
        print(f"\nHandles Sync Summary:")
        print(f"  Total processed products: {len(products)}")
        print(f"  Images assigned and activated: {updated_count}")
        print(f"  Deactivated / archived: {archived_count}")

if __name__ == "__main__":
    asyncio.run(main())
