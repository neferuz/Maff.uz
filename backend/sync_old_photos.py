import asyncio
import csv
import os
import subprocess
import sys

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def main():
    print("=== STARTING PRODUCT PHOTO SYNCHRONIZATION FROM OLD SITE (POSTGRESQL) ===")
    
    # 1. Run mysql queries to dump data to TSV
    print("Exporting element and file mappings from old Bitrix sitemanager MySQL database...")
    try:
        subprocess.run("mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, CODE, DETAIL_PICTURE, PREVIEW_PICTURE FROM b_iblock_element\" > /tmp/old_products.tsv", shell=True, check=True)
        subprocess.run("mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, SUBDIR, FILE_NAME FROM b_file\" > /tmp/old_files.tsv", shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error executing MySQL command. Are you running on the production server? Details: {e}")
        return

    # 2. Parse b_file data into a mapping dictionary: file_id -> file path
    file_map = {}
    if os.path.exists('/tmp/old_files.tsv'):
        with open('/tmp/old_files.tsv', 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter='\t')
            try:
                next(reader) # skip header
            except StopIteration:
                pass
            for row in reader:
                if len(row) >= 3:
                    file_id, subdir, file_name = row[0], row[1], row[2]
                    file_map[file_id] = f"upload/{subdir}/{file_name}"
    
    print(f"Loaded {len(file_map)} file paths from b_file.")

    # 3. Parse b_iblock_element data into lookup dictionaries
    old_products_by_xml_id = {}
    old_products_by_name = {}

    if os.path.exists('/tmp/old_products.tsv'):
        with open('/tmp/old_products.tsv', 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter='\t')
            try:
                next(reader) # skip header
            except StopIteration:
                pass
            for row in reader:
                if len(row) >= 6:
                    el_id, name, xml_id, code, detail_pic, preview_pic = row[0], row[1], row[2], row[3], row[4], row[5]
                    
                    # Choose detail picture first, then preview picture
                    pic_id = detail_pic if (detail_pic and detail_pic != 'NULL') else (preview_pic if (preview_pic and preview_pic != 'NULL') else None)
                    if not pic_id:
                        continue
                        
                    img_path = file_map.get(pic_id)
                    if not img_path:
                        continue

                    prod_info = {
                        "id": el_id,
                        "name": name,
                        "xml_id": xml_id,
                        "code": code,
                        "image_path": img_path
                    }

                    # Map by XML_ID (uuid)
                    if xml_id and xml_id != 'NULL':
                        old_products_by_xml_id[xml_id] = prod_info
                        # Also check if it's a composite key (UUID#UUID) and map by its parts
                        if '#' in xml_id:
                            for part in xml_id.split('#'):
                                if part:
                                    old_products_by_xml_id[part] = prod_info

                    # Map by name (normalized lowercase)
                    norm_name = name.strip().lower()
                    if norm_name:
                        old_products_by_name[norm_name] = prod_info

    print(f"Loaded {len(old_products_by_xml_id)} XML_ID/UUID mappings and {len(old_products_by_name)} name mappings.")

    # 4. Connect to PostgreSQL and update
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT id, name, ref_key, image_url, category_id FROM product"))
        products = result.fetchall()
        print(f"Found {len(products)} products in the new PostgreSQL database.")

        updated_count = 0
        match_by_ref_key = 0
        match_by_name = 0

        for p in products:
            p_id, p_name, p_ref_key, p_img, p_cat_id = p
            
            # Check if product needs an image
            is_placeholder = not p_img or p_img == 'None' or 'unsplash' in p_img.lower() or p_img.strip() == '' or 'placeholder' in p_img.lower()
            is_silkwood = (p_cat_id == 418) or (p_name and 'silkwood' in p_name.lower())
            
            needs_update = is_placeholder or is_silkwood
            
            if not needs_update:
                continue

            matched_prod = None
            match_method = None

            # 1. Try matching by ref_key (1C UUID)
            if p_ref_key:
                matched_prod = old_products_by_xml_id.get(p_ref_key)
                if matched_prod:
                    match_method = "ref_key"
                    match_by_ref_key += 1

            # 2. Try matching by exact name (case-insensitive) as a fallback
            if not matched_prod and p_name:
                norm_name = p_name.strip().lower()
                norm_name_clean = norm_name.replace(" (образец)", "").strip()
                
                matched_prod = old_products_by_name.get(norm_name) or old_products_by_name.get(norm_name_clean)
                if matched_prod:
                    match_method = "name"
                    match_by_name += 1

            if matched_prod:
                new_img_path = matched_prod["image_path"]
                # Ensure it has a leading slash
                if not new_img_path.startswith('/'):
                    new_img_path = '/' + new_img_path
                    
                await session.execute(
                    text("UPDATE product SET image_url = :image_url WHERE id = :id"),
                    {"image_url": new_img_path, "id": p_id}
                )
                updated_count += 1
                
                if updated_count <= 25:
                    print(f"  [Match by {match_method}]: SQLite '{p_name}' -> Old Site '{matched_prod['name']}' ({new_img_path})")

        await session.commit()

    print("\n=== SYNCHRONIZATION SUMMARY ===")
    print(f"  Total products updated with old site images: {updated_count}")
    print(f"  Matched via ref_key (1C UUID): {match_by_ref_key}")
    print(f"  Matched via product name: {match_by_name}")
    print("==========================================")

    # Clean up temp files
    for temp_file in ['/tmp/old_products.tsv', '/tmp/old_files.tsv']:
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass

if __name__ == "__main__":
    asyncio.run(main())
