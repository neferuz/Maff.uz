import asyncio
from app.services.one_c import one_c_service

async def main():
    skip = 0
    top = 1000
    all_items = []
    
    while True:
        items = await one_c_service.fetch_nomenclatura(top=top, skip=skip, is_folder=None)
        if not items:
            break
        all_items.extend(items)
        skip += top
        
    print(f"Total items fetched: {len(all_items)}")
    
    # Filter folders manually
    folders = [i for i in all_items if i.get("IsFolder") == True]
    print(f"Total folders found: {len(folders)}")
    
    # uPortika UUID
    uportika_id = 'a9fac7e2-727f-11ef-8c32-c42dcda0bdba'
    
    print("\n--- Direct children of uPortika ---")
    children = [f for f in folders if f.get("Parent_Key") == uportika_id]
    for c in children:
        print(f"{c.get('Description')} ({c.get('Ref_Key')})")
        
    print("\n--- Grandchildren of uPortika ---")
    for c in children:
        grandchildren = [f for f in folders if f.get("Parent_Key") == c.get("Ref_Key")]
        for gc in grandchildren:
            print(f"  Under {c.get('Description')}: {gc.get('Description')} ({gc.get('Ref_Key')})")
            
    # Also let's check 'ac22609c-8805-11ec-aa01-505dac4282cc' (Двери Мебель)
    dveri_mebel_id = 'ac22609c-8805-11ec-aa01-505dac4282cc'
    print("\n--- Direct children of Двери Мебель ---")
    children_mebel = [f for f in folders if f.get("Parent_Key") == dveri_mebel_id]
    for c in children_mebel:
        print(f"{c.get('Description')} ({c.get('Ref_Key')})")
        
    print("\n--- Any folder with Portika in name ---")
    portika_folders = [f for f in folders if 'portika' in f.get('Description', '').lower() or 'портика' in f.get('Description', '').lower()]
    for f in portika_folders:
        print(f"{f.get('Description')} ({f.get('Ref_Key')}) - Parent: {f.get('Parent_Key')}")

asyncio.run(main())
