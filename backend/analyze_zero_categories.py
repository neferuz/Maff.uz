import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Category, Product
from sqlalchemy import select, func
from app.services.one_c import one_c_service

async def main():
    async with AsyncSessionLocal() as session:
        # Load all DB categories
        res_cat = await session.execute(select(Category))
        categories = res_cat.scalars().all()
        cat_map = {c.id: c for c in categories}
        cat_ref_map = {c.ref_key: c for c in categories if c.ref_key}
        
        # Load all DB products
        res_prod = await session.execute(select(Product))
        products = res_prod.scalars().all()
        
        # Count products per category
        prod_counts = {}
        for p in products:
            prod_counts[p.category_id] = prod_counts.get(p.category_id, 0) + 1
            
        print("=== CATEGORIES WITH 0 PRODUCTS IN DB ===")
        zero_cats = [c for c in categories if prod_counts.get(c.id, 0) == 0]
        print(f"Total categories with 0 products: {len(zero_cats)}")
        
        for c in sorted(zero_cats, key=lambda x: x.id):
            parent_name = cat_map[c.parent_id].name if c.parent_id in cat_map else "None"
            print(f"ID: {c.id:3d} | RefKey: {c.ref_key} | Name: {c.name} | Parent: {parent_name}")
            
        print("\nFetching OData nomenclature to find matches...")
        skip = 0
        batch_size = 1000
        all_1c_items = []
        while True:
            items = await one_c_service.fetch_nomenclatura(top=batch_size, skip=skip, is_folder=False)
            if not items:
                break
            all_1c_items.extend(items)
            skip += batch_size
            if len(items) < batch_size:
                break
                
        print(f"Total 1C products: {len(all_1c_items)}")
        
        # Check if any 1C products have Parent_Key matching the zero categories
        parents_in_1c = {}
        for item in all_1c_items:
            p_key = item.get("Parent_Key")
            if p_key:
                parents_in_1c[p_key] = parents_in_1c.get(p_key, 0) + 1
                
        print("\n=== MATCHING 1C PRODUCTS BY PARENT_KEY FOR ZERO CATEGORIES ===")
        found_parent_matches = False
        for c in zero_cats:
            if c.ref_key in parents_in_1c:
                found_parent_matches = True
                print(f"Category ID {c.id} ({c.name}) has {parents_in_1c[c.ref_key]} products in 1C under this Parent_Key!")
                
        if not found_parent_matches:
            print("No zero-product categories have products in 1C matching by direct Parent_Key.")

        # Let's search 1C names by keywords of these zero categories
        print("\n=== SEARCHING ODATA NAMES FOR ZERO CATEGORY KEYWORDS ===")
        for c in zero_cats:
            # Skip very general names
            cname = c.name.strip()
            if len(cname) < 4 or cname.upper() in ['ЛАМИНАТ', 'ПАРКЕТ', 'ПЛИНТУС', 'ДВЕРИ', 'РУЧКИ', 'OSB', 'ПОРОГИ', 'ПОДЛОЖКА']:
                continue
                
            # Search 1C for names containing this category name
            matches = []
            for item in all_1c_items:
                iname = (item.get("НаименованиеПолное") or item.get("Description") or "").upper()
                if cname.upper() in iname:
                    matches.append(item)
                    
            if matches:
                print(f"\nCategory ID {c.id} ({c.name}) matches {len(matches)} products in 1C:")
                for m in matches[:5]:
                    print(f"  - 1C Name: {m.get('НаименованиеПолное') or m.get('Description')} | Parent_Key: {m.get('Parent_Key')}")

if __name__ == "__main__":
    asyncio.run(main())
