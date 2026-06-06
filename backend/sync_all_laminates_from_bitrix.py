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
    
    # Query Bitrix elements with their SKU and preview/detail pictures
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
            # fill up with None
            parts += [None] * (5 - len(parts))
        
        el_id, name, sku, subdir, filename = parts[:5]
        
        # If no SKU but name has digits, extract first digit sequence
        sku_val = sku if sku and sku != "NULL" else None
        
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
    # Lowercase and keep only letters/numbers
    return re.sub(r'[^a-z0-9]', '', name.lower())

async def main():
    bitrix_prods = await fetch_bitrix_products()
    print(f"Fetched {len(bitrix_prods)} products from Bitrix.")
    
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Get all laminate products (categories under parent 1)
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
        
        print("\n=== DRY RUN: Matching Results ===")
        for p in pg_prods:
            matched = False
            best_match = None
            
            # Try matching by SKU (article) first
            p_sku = p.sku.strip() if p.sku else ""
            if p_sku:
                for bp in bitrix_prods:
                    bp_sku = bp["sku"].strip() if bp["sku"] else ""
                    if bp_sku and (p_sku.lower() in bp_sku.lower() or bp_sku.lower() in p_sku.lower()):
                        best_match = bp
                        matched = True
                        break
            
            # Try matching by Name if no SKU match
            if not matched:
                p_name_clean = clean_name(p.name)
                # Remove common prefixes/words for better matching
                for bp in bitrix_prods:
                    bp_name_clean = clean_name(bp["name"])
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
