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

async def fetch_bitrix_products():
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
    # Lowercase and keep only English/Russian letters and numbers
    return re.sub(r'[^a-zа-я0-9ё]', '', name.lower())

# Extract decor codes like EPL146, PRK509, 3963 from product name
def extract_decor_code(name):
    if not name:
        return None
    # 1. Match EPL/EHL/EL/PRK followed by digits (e.g. EPL146, PRK215)
    m = re.search(r'\b(E[P|H]L\d+|EL\d+|PRK\d+)\b', name, re.IGNORECASE)
    if m:
        return m.group(1).upper()
        
    # 2. Match 4-5 digit numbers representing Swiss Krono SKUs (e.g. 80194, 4582)
    m2 = re.findall(r'\b(\d{4,5})\b', name)
    if m2:
        # Avoid common dimensions like 1285 or 1380
        for num in m2:
            if num not in ["1285", "1380", "1375"]:
                return num
    return None

async def main():
    bitrix_prods = await fetch_bitrix_products()
    print(f"Fetched {len(bitrix_prods)} products from Bitrix.")
    
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        children_map = {}
        for c in categories:
            if c.parent_id:
                if c.parent_id not in children_map:
                    children_map[c.parent_id] = []
                children_map[c.parent_id].append(c.id)
                
        def get_all_descendants(cat_id):
            descendants = []
            children = children_map.get(cat_id, [])
            for child in children:
                descendants.append(child)
                descendants.extend(get_all_descendants(child))
            return descendants
            
        laminate_cat_ids = [1] + get_all_descendants(1)
        
        res_prods = await conn.execute(text(f"""
            SELECT id, name, sku, category_id, image_url, is_active 
            FROM product 
            WHERE category_id IN ({','.join(map(str, laminate_cat_ids))})
        """))
        pg_prods = res_prods.fetchall()
        print(f"Fetched {len(pg_prods)} laminate products from PostgreSQL.")
        
        matched_count = 0
        unmatched_count = 0
        
        print("\n=== DRY RUN: Matching Results (V2) ===")
        for p in pg_prods:
            matched = False
            best_match = None
            
            p_sku = p.sku.strip() if p.sku else ""
            p_decor = extract_decor_code(p.name) or p_sku
            
            # 1. Match by extracted Decor Code (like EPL146 or 80194)
            if p_decor:
                for bp in bitrix_prods:
                    bp_decor = extract_decor_code(bp["name"]) or (bp["sku"].strip() if bp["sku"] else "")
                    if bp_decor and p_decor.upper() == bp_decor.upper():
                        best_match = bp
                        matched = True
                        break
            
            # 2. Fallback to clean name substring match only if names are reasonably long
            if not matched:
                p_name_clean = clean_name(p.name)
                for bp in bitrix_prods:
                    bp_name_clean = clean_name(bp["name"])
                    # Require minimum length of 6 characters to prevent matching generic short words
                    if len(bp_name_clean) > 8 and len(p_name_clean) > 8:
                        if p_name_clean in bp_name_clean or bp_name_clean in p_name_clean:
                            best_match = bp
                            matched = True
                            break
                            
            if matched and best_match["image_path"]:
                matched_count += 1
                print(f"MATCH: PG ID={p.id} | Name='{p.name}' | SKU='{p.sku}'  <===>  Bitrix Name='{best_match['name']}' | SKU='{best_match['sku']}' | Image='{best_match['image_path']}'")
            else:
                unmatched_count += 1
                # print(f"NO MATCH: PG ID={p.id} | Name='{p.name}' | SKU='{p.sku}'")
                
        print(f"\nSummary: Total Laminates={len(pg_prods)} | Matched={matched_count} | Unmatched={unmatched_count}")

if __name__ == "__main__":
    asyncio.run(main())
