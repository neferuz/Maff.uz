import asyncio
import asyncpg
import pandas as pd
import hashlib

def get_image_placeholder(name, sku):
    if not name: return None
    door_placeholders = [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"
    ]
    floor_placeholders = [
        "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop"
    ]
    hardware_placeholders = [
        "https://images.unsplash.com/photo-1558236894-35222ba3c0e8?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585465942738-f14d8ea0a3e8?q=80&w=800&auto=format&fit=crop"
    ]
    
    name_lower = str(name).lower()
    is_door = any(k in name_lower for k in ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико', 'baguette'])
    is_hardware = any(k in name_lower for k in ['ручк', 'петл', 'замок', 'упор', 'защелк', 'фиксатор', 'накладка', 'cilind'])
    
    text_to_hash = f"{name}{sku or ''}".encode('utf-8')
    h_idx = int(hashlib.md5(text_to_hash).hexdigest(), 16)
    
    if is_door:
        return door_placeholders[h_idx % len(door_placeholders)]
    elif is_hardware:
        return hardware_placeholders[h_idx % len(hardware_placeholders)]
    else:
        return floor_placeholders[h_idx % len(floor_placeholders)]

async def main():
    print("Connecting to DB...")
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    print("Reading CSV hierarchy...")
    df_csv = pd.read_csv('/Users/apple/Desktop/Maff.uz-main/products_hierarchy_202604281544.csv', sep=';', dtype=str)
    # create a map of uuid -> full path row
    csv_map = {}
    for _, row in df_csv.iterrows():
        csv_map[row['uuid'].lower()] = dict(row)
        
    print("Fetching existing categories...")
    rows = await conn.fetch("SELECT id, name FROM category")
    db_cats = {r['name'].strip().lower(): r['id'] for r in rows}
    
    # We need a root category for missing ones
    missing_cat_name = "Прочее (Из 1С)"
    if missing_cat_name.lower() not in db_cats:
        print(f"Creating root category '{missing_cat_name}'...")
        new_id = await conn.fetchval(
            "INSERT INTO category (name, is_active) VALUES ($1, false) RETURNING id", 
            missing_cat_name
        )
        db_cats[missing_cat_name.lower()] = new_id
    
    prochee_id = db_cats[missing_cat_name.lower()]
    
    # Map logic
    def guess_category(row):
        if not row: return None
        path_str = " ".join([str(row.get(f'Уровень_{i}', '')) for i in range(1, 7)]).lower()
        
        # Hard mappings based on the new structure
        if "задор" in path_str or "zadoor" in path_str: return db_cats.get("двери zadoor")
        if "волховец" in path_str: return db_cats.get("двери волховец")
        if "profil doors" in path_str: return db_cats.get("двери zadoor") # fallback
        if "двери" in path_str and not "фурнитура" in path_str: return db_cats.get("двери zadoor") # fallback doors
        
        if "арбитон" in path_str or "солид" in path_str or "плинтус" in path_str or "русский профиль" in path_str: 
            if "порог" in path_str or "русский профиль" in path_str: return db_cats.get("пороги")
            return db_cats.get("плинтус")
            
        if "подложка" in path_str or "эко пробка" in path_str:
            return db_cats.get("подложка под паркет и ламинат")
            
        if "spc" in path_str: return db_cats.get("spс") # Note: C is cyrillic in user's DB probably?
        
        if "ламинированные полы" in path_str or "ламинат" in path_str: return db_cats.get("ламинат")
        if "паркет" in path_str: return db_cats.get("паркетная доска")
        if "осп" in path_str or "osb" in path_str: return db_cats.get("osb")
        if "фурнитура" in path_str or "ручк" in path_str: return db_cats.get("ручки stimul")
        if "декор" in path_str or "frente" in path_str or "wpc" in path_str: return db_cats.get("декоративные настенные декоры agt")
        
        return None
        
    print("Fetching uncategorized products...")
    uncat_products = await conn.fetch("SELECT id, name, sku, ref_key FROM product WHERE category_id IS NULL")
    print(f"Found {len(uncat_products)} uncategorized products.")
    
    updates = 0
    created_cats = {}
    
    for p in uncat_products:
        ref_key = p['ref_key']
        if not ref_key: continue
        
        row = csv_map.get(ref_key.lower())
        cat_id = guess_category(row)
        
        if not cat_id and row:
            # Need to create missing category
            lvl_name = row.get('Уровень_1', '')
            if pd.isna(lvl_name) or not lvl_name: lvl_name = "Неизвестно"
            
            if lvl_name.lower() not in db_cats:
                print(f"Creating missing category: {lvl_name} under 'Прочее (Из 1С)'")
                import uuid
                slug = str(uuid.uuid4())[:8]
                new_id = await conn.fetchval(
                    "INSERT INTO category (name, is_active, parent_id) VALUES ($1, false, $2) RETURNING id",
                    lvl_name, prochee_id
                )
                db_cats[lvl_name.lower()] = new_id
            
            cat_id = db_cats[lvl_name.lower()]
            
        if cat_id:
            await conn.execute("UPDATE product SET category_id = $1 WHERE id = $2", cat_id, p['id'])
            updates += 1
            
    print(f"Categorized {updates} missing products.")
    
    print("Restoring missing images...")
    products = await conn.fetch("SELECT id, name, sku, image_url FROM product")
    img_updates = 0
    for p in products:
        if not p['image_url']:
            img = get_image_placeholder(p['name'], p['sku'])
            if img:
                await conn.execute("UPDATE product SET image_url = $1 WHERE id = $2", img, p['id'])
                img_updates += 1
                
    print(f"Restored photos for {img_updates} products.")
    
    await conn.close()
    print("Done!")

if __name__ == '__main__':
    asyncio.run(main())
