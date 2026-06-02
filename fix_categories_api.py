import asyncio
import asyncpg
import httpx

async def main():
    print("Connecting to DB...")
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    print("Fetching existing categories...")
    rows = await conn.fetch("SELECT id, name FROM category")
    db_cats = {r['name'].strip().lower(): r['id'] for r in rows}
    prochee_id = db_cats["прочее (из 1с)"]
    
    print("Fetching uncategorized products...")
    uncat_products = await conn.fetch("SELECT id, name, sku, ref_key FROM product WHERE category_id IS NULL")
    
    base_url = "https://api.eman.uz/api/odata/palisandr_fresh/"
    headers = {
        "X-API-TOKEN": "XKtjqpkmy56WsLD63NvVOCXp4FyTuuqju0GoAhpElBzFHikN",
        "Accept": "application/json"
    }
    
    # 1. Fetch all folders from 1C to create a map of ref_key -> Folder Name
    print("Fetching 1C folders...")
    folders_map = {}
    async with httpx.AsyncClient(timeout=60.0) as client:
        skip = 0
        while True:
            url = f"{base_url}Catalog_Номенклатура?$format=json&$select=Ref_Key,Description,Parent_Key&$filter=IsFolder eq true&$skip={skip}&$top=1000"
            res = await client.get(url, headers=headers)
            items = res.json().get("value", [])
            if not items: break
            for it in items:
                folders_map[it['Ref_Key']] = it
            skip += 1000
            
    # 2. Fetch all products from 1C to get their Parent_Key
    print("Fetching 1C products...")
    products_map = {}
    async with httpx.AsyncClient(timeout=60.0) as client:
        skip = 0
        while True:
            url = f"{base_url}Catalog_Номенклатура?$format=json&$select=Ref_Key,Parent_Key&$filter=IsFolder eq false&$skip={skip}&$top=1000"
            res = await client.get(url, headers=headers)
            items = res.json().get("value", [])
            if not items: break
            for it in items:
                products_map[it['Ref_Key']] = it['Parent_Key']
            skip += 1000
            
    def get_full_path(parent_key):
        path = []
        curr = parent_key
        while curr and curr != '00000000-0000-0000-0000-000000000000':
            folder = folders_map.get(curr)
            if not folder: break
            path.insert(0, folder['Description'])
            curr = folder['Parent_Key']
        return path
        
    def guess_category(path):
        path_str = " ".join(path).lower()
        if "задор" in path_str or "zadoor" in path_str: return db_cats.get("двери zadoor")
        if "волховец" in path_str: return db_cats.get("двери волховец")
        if "profil doors" in path_str: return db_cats.get("двери zadoor")
        if "двери" in path_str and not "фурнитура" in path_str: return db_cats.get("двери zadoor")
        
        if "арбитон" in path_str or "солид" in path_str or "плинтус" in path_str or "русский профиль" in path_str: 
            if "порог" in path_str or "русский профиль" in path_str: return db_cats.get("пороги")
            return db_cats.get("плинтус")
            
        if "подложка" in path_str or "эко пробка" in path_str: return db_cats.get("подложка под паркет и ламинат")
        if "spc" in path_str: return db_cats.get("spс")
        if "ламинированные полы" in path_str or "ламинат" in path_str: return db_cats.get("ламинат")
        if "паркет" in path_str: return db_cats.get("паркетная доска")
        if "осп" in path_str or "osb" in path_str: return db_cats.get("osb")
        if "фурнитура" in path_str or "ручк" in path_str: return db_cats.get("ручки stimul")
        if "декор" in path_str or "frente" in path_str or "wpc" in path_str: return db_cats.get("декоративные настенные декоры agt")
        return None

    updates = 0
    for p in uncat_products:
        ref_key = p['ref_key']
        parent_key = products_map.get(ref_key)
        
        if parent_key:
            path = get_full_path(parent_key)
            cat_id = guess_category(path)
            
            if not cat_id and path:
                lvl_name = path[0]
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
                
    print(f"Categorized {updates} missing products via API logic.")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
