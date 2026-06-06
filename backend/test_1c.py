import asyncio
from app.services.one_c import one_c_service

async def main():
    try:
        uuids = ('a9fac7e2-727f-11ef-8c32-c42dcda0bdba', 'ac22609c-8805-11ec-aa01-505dac4282cc')
        skip = 0
        top = 1000
        all_items = []
        
        while True:
            items = await one_c_service.fetch_nomenclatura(top=top, skip=skip, is_folder=None)
            if not items:
                break
            all_items.extend(items)
            skip += top
            print(f"Fetched {len(all_items)} items so far...")
            
        print(f"Total items fetched: {len(all_items)}")
        
        matches = [f for f in all_items if f.get("Ref_Key") in uuids or f.get("Parent_Key") in uuids]
        print(f"Found {len(matches)} items matching the UUIDs or children of them.")
        for f in matches:
            print(f"Item: {f.get('Description')} | Key: {f.get('Ref_Key')} | Parent: {f.get('Parent_Key')} | IsFolder: {f.get('IsFolder')}")
    except Exception as e:
        print(f"ERROR: {e}")

asyncio.run(main())
