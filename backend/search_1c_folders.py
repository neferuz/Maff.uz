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
    
    folders = [i for i in all_items if i.get("IsFolder") == True]
    # Wait, earlier I found only 1 folder because IsFolder is false for everything!
    # Let me print ALL items that contain "Неоклассико" to see their Parent_Key!
    print("\n--- Items with Неоклассико ---")
    matches = [i for i in all_items if 'неоклассико' in i.get('Description', '').lower()]
    for m in matches[:5]:
        print(f"Name: {m.get('Description')} | Parent: {m.get('Parent_Key')} | Ref: {m.get('Ref_Key')}")

asyncio.run(main())
