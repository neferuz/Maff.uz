import asyncio
import paramiko
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

ssh_host = '192.168.183.35'
ssh_user = 'root'
ssh_pass = 'rJhj,rf2@'

async def fetch_bitrix_items():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ssh_host, username=ssh_user, password=ssh_pass, timeout=15)
    
    query = """
    mysql -D sitemanager -B -N -e "
    SELECT 
        el.ID, 
        el.NAME, 
        prop.VALUE,
        f.SUBDIR,
        f.FILE_NAME
    FROM b_iblock_element el
    LEFT JOIN b_iblock_element_property prop ON el.ID = prop.IBLOCK_ELEMENT_ID AND prop.IBLOCK_PROPERTY_ID = 112
    LEFT JOIN b_file f ON el.DETAIL_PICTURE = f.ID OR el.PREVIEW_PICTURE = f.ID
    WHERE el.IBLOCK_ID = 2;
    "
    """
    stdin, stdout, stderr = client.exec_command(query)
    output = stdout.read().decode('utf-8')
    client.close()
    
    products = []
    for line in output.strip().split('\n'):
        if not line:
            continue
        parts = line.split('\t')
        if len(parts) < 5:
            parts += [None] * (5 - len(parts))
        
        el_id, name, sku, subdir, filename = parts[:5]
        sku_val = sku if sku and sku != "NULL" and sku.strip() != "" else None
        
        img_path = None
        if subdir and filename and subdir != "NULL" and filename != "NULL":
            img_path = f"/upload/{subdir}/{filename}"
            
        products.append({
            "bitrix_id": el_id,
            "name": name,
            "sku": sku_val,
            "image_path": img_path
        })
    return products

def clean_name(name):
    if not name:
        return ""
    # Normalize Cyrillic and remove symbols
    return re.sub(r'[^a-zа-я0-9ё]', '', name.lower())

def get_base_model(name):
    if not name:
        return ""
    name_lower = name.lower()
    
    # Models list to check
    models = [
        "agate", "akik", "aten", "atlas", "axel-l", "axel l", "bolivar", "carme", 
        "concordia", "despina", "gamma", "jasper", "libra", "linear", "maja", "marvel", 
        "metis", "mimas", "odin", "pixar-l", "pixar l", "prizma", "rocca", "rocket", 
        "rodin", "sarp", "sinus", "spinal", "stark", "vega", "vision", "zetta", "stimul"
    ]
    
    for m in models:
        # Check if model name as word exists in name
        pattern = r'\b' + re.escape(m.replace('-', r'[\s-]?')) + r'\b'
        if re.search(pattern, name_lower):
            return m.replace(' ', '-')
            
    return ""

async def main():
    bitrix_prods = await fetch_bitrix_items()
    print(f"Fetched {len(bitrix_prods)} products from Bitrix.")
    
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        all_cats = {row[0]: (row[1], row[2]) for row in categories}
        
        def get_all_descendants(cat_id):
            desc = []
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    desc.append(cid)
                    desc.extend(get_all_descendants(cid))
            return list(set(desc))
            
        # Target Category 356 (Ручки) and all subcategories
        handle_cats = [356] + get_all_descendants(356)
        print(f"Target categories list count: {len(handle_cats)}")
        
        res_prods = await conn.execute(text(f"""
            SELECT id, name, sku, category_id, image_url, is_active 
            FROM product 
            WHERE category_id IN ({','.join(map(str, handle_cats))})
        """))
        pg_prods = res_prods.fetchall()
        print(f"Fetched {len(pg_prods)} handle products from PostgreSQL.")
        
        # Local handles folder list
        local_files = [
            "agate_nbm_pn_nbm.jpg", "akik_nbm.jpg", "aten_nbm.jpg", "atlas_bbn.jpg", 
            "axel_l_al6.jpg", "bolivar_cbm.webp", "carme_bbn.jpg", "concordia_bbn.jpg", 
            "flow_dm_ssg39.jpg", "gamma_al15.jpg", "maja_nbm.jpg", "marvel_nbm.jpg", 
            "pixar_l_abm.jpg", "prizma_gb.jpg", "rocca_gl.jpg", "rocket_nbm.jpg", 
            "rodin_abm.jpg", "sarp_nbm.jpg", "spinal_nbm.jpg", "vision_nbm.jpg", 
            "wc_bolt_bk6_1ab_gp7.jpg"
        ]
        
        matched_bitrix = 0
        matched_local = 0
        unmatched = 0
        
        for p in pg_prods:
            p_sku = p.sku.strip() if p.sku else ""
            p_name_lower = p.name.lower()
            
            is_turn_button = any(k in p_name_lower for k in ["поворот", "wc-bolt", "wc_bolt", "толчок", "накладка поворот"])
            
            best_match = None
            matched = False
            
            # 1. Try to match from Bitrix by SKU
            if p_sku:
                for bp in bitrix_prods:
                    bp_sku = bp["sku"].strip() if bp["sku"] else ""
                    if bp_sku and p_sku.lower() == bp_sku.lower() and bp["image_path"]:
                        best_match = bp
                        matched = True
                        break
            
            # 2. Try to match from Bitrix by Name
            if not matched:
                p_name_clean = clean_name(p.name)
                for bp in bitrix_prods:
                    bp_name_clean = clean_name(bp["name"])
                    if p_name_clean == bp_name_clean and bp["image_path"]:
                        best_match = bp
                        matched = True
                        break
                        
            # 3. Try to match from Bitrix by substring Name
            if not matched:
                p_name_clean = clean_name(p.name)
                for bp in bitrix_prods:
                    bp_name_clean = clean_name(bp["name"])
                    if len(bp_name_clean) > 8 and len(p_name_clean) > 8 and bp["image_path"]:
                        if p_name_clean in bp_name_clean or bp_name_clean in p_name_clean:
                            best_match = bp
                            matched = True
                            break
                            
            if matched and best_match and best_match["image_path"]:
                matched_bitrix += 1
                img = best_match["image_path"]
                # Check if Bitrix image is a turn button or handle and verify we don't mix them up
                bp_name_lower = best_match["name"].lower()
                bp_is_turn = any(k in bp_name_lower for k in ["поворот", "wc-bolt", "wc_bolt", "толчок", "накладка поворот"])
                
                # Warning if mismatch
                mismatch_warn = ""
                if is_turn_button != bp_is_turn:
                    mismatch_warn = " [WARNING: Bitrix Type Mismatch!]"
                
                print(f"BITRIX MATCH: '{p.name}' ==> Image='{img}'{mismatch_warn}")
            else:
                # Try local fallback matching
                base_model = get_base_model(p.name)
                
                if is_turn_button:
                    # WC Turn button gets the wc_bolt picture
                    local_img = "/static/uploads/handles/wc_bolt_bk6_1ab_gp7.jpg"
                    matched_local += 1
                    print(f"LOCAL WC-BOLT MATCH: '{p.name}' ==> Image='{local_img}'")
                elif base_model:
                    # Find matching model file
                    clean_model = base_model.replace('-', '_')
                    found_file = None
                    for lf in local_files:
                        if lf.startswith(clean_model):
                            found_file = lf
                            break
                    if found_file:
                        local_img = f"/static/uploads/handles/{found_file}"
                        matched_local += 1
                        print(f"LOCAL MODEL MATCH: '{p.name}' (Model={base_model}) ==> Image='{local_img}'")
                    else:
                        unmatched += 1
                        print(f"UNMATCHED: '{p.name}' (Model={base_model} but no local file)")
                else:
                    unmatched += 1
                    print(f"UNMATCHED: '{p.name}' (No model and no Bitrix match)")
                    
        print(f"\nSummary: Total={len(pg_prods)} | Bitrix Matched={matched_bitrix} | Local Matched={matched_local} | Unmatched={unmatched}")

asyncio.run(main())
