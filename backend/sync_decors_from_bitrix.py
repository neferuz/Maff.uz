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
    return re.sub(r'[^a-zа-я0-9ё]', '', name.lower())

async def main():
    bitrix_prods = await fetch_bitrix_items()
    print(f"Fetched {len(bitrix_prods)} products from Bitrix.")
    
    # Extract Frente collection images
    collection_images = {}
    for bp in bitrix_prods:
        bp_name_upper = bp["name"].upper().strip()
        if bp_name_upper in ["DARYO", "NUR", "SAMO", "HUMO"] and bp["image_path"]:
            collection_images[bp_name_upper] = bp["image_path"]
            
    print(f"Extracted collection images: {collection_images}")
    
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
            
        # Target Category 242 (Декоративные настенные декоры) and descendants
        decor_cats = [242] + get_all_descendants(242)
        print(f"Target categories list count: {len(decor_cats)}")
        
        res_prods = await conn.execute(text(f"""
            SELECT id, name, sku, category_id, image_url, is_active 
            FROM product 
            WHERE category_id IN ({','.join(map(str, decor_cats))})
        """))
        pg_prods = res_prods.fetchall()
        print(f"Fetched {len(pg_prods)} decor products from PostgreSQL.")
        
        updated_ids = []
        matched_count = 0
        
        for p in pg_prods:
            matched = False
            best_match = None
            
            p_sku = p.sku.strip() if p.sku else ""
            
            # 1. Match by SKU exactly
            if p_sku:
                for bp in bitrix_prods:
                    bp_sku = bp["sku"].strip() if bp["sku"] else ""
                    if bp_sku and p_sku.lower() == bp_sku.lower() and bp["image_path"]:
                        best_match = bp
                        matched = True
                        break
            
            # 2. Match by exact clean name
            if not matched:
                p_name_clean = clean_name(p.name)
                for bp in bitrix_prods:
                    bp_name_clean = clean_name(bp["name"])
                    if p_name_clean == bp_name_clean and bp["image_path"]:
                        best_match = bp
                        matched = True
                        break
                        
            # 3. Match by partial clean name
            if not matched:
                p_name_clean = clean_name(p.name)
                for bp in bitrix_prods:
                    bp_name_clean = clean_name(bp["name"])
                    if len(bp_name_clean) > 8 and len(p_name_clean) > 8 and bp["image_path"]:
                        if p_name_clean in bp_name_clean or bp_name_clean in p_name_clean:
                            best_match = bp
                            matched = True
                            break
                            
            img_url = None
            if matched and best_match and best_match["image_path"]:
                img_url = best_match["image_path"]
            else:
                # 4. Collection-based matching for FRENTE
                p_name_lower = p.name.lower()
                for collection_name in ["daryo", "nur", "samo", "humo"]:
                    if collection_name in p_name_lower:
                        coll_key = collection_name.upper()
                        if coll_key in collection_images:
                            img_url = collection_images[coll_key]
                            matched = True
                            break
                            
            if matched and img_url:
                await conn.execute(
                    text("UPDATE product SET image_url = :img, is_active = True WHERE id = :id"),
                    {"img": img_url, "id": p.id}
                )
                matched_count += 1
                updated_ids.append(p.id)
                print(f"MATCHED & ACTIVATED: '{p.name}' ==> Image='{img_url}'")
                
        # 5. Archive all products in these categories that still have no images
        print("\nArchiving unmatched wall decors without photos...")
        no_photo_query = f"""
            SELECT id, name, sku, image_url
            FROM product
            WHERE category_id IN ({','.join(map(str, decor_cats))})
            AND is_active = True
            AND (image_url IS NULL OR image_url = '' OR image_url LIKE '%zadoor%' OR image_url LIKE '/images/products/%')
        """
        res_no_photo = await conn.execute(text(no_photo_query))
        no_photo_prods = res_no_photo.fetchall()
        
        to_archive = [p.id for p in no_photo_prods]
        if to_archive:
            print(f"Found {len(to_archive)} decor products without photos to archive.")
            archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"
            result = await conn.execute(text(archive_query))
            print(f"Successfully deactivated {result.rowcount} product(s).")
        else:
            print("No products without photos to archive.")
            
        print(f"\nSummary: Total={len(pg_prods)} | Matched & Activated={matched_count} | Archived={len(to_archive)}")

if __name__ == "__main__":
    asyncio.run(main())
