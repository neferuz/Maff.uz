import asyncio
from app.services.one_c import one_c_service

async def main():
    skip = 0
    found = []
    while True:
        res = await one_c_service.fetch_nomenclatura(top=1000, skip=skip, is_folder=False)
        if not res:
            break
        for p in res:
            desc = p.get('Description', '').lower()
            name = p.get('НаименованиеПолное', '').lower()
            if 'ehc' in desc or 'ehc' in name:
                found.append(p)
        skip += 1000
        
    print(f"\nFound {len(found)} products matching 'ehc':")
    for p in found:
        print(f"Name: {p.get('Description')} (Ref: {p.get('Ref_Key')})")
        
if __name__ == "__main__":
    asyncio.run(main())
