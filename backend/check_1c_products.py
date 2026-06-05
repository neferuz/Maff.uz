import asyncio
from app.services.one_c import one_c_service

async def main():
    print("Fetching 1C nomenclature products...")
    skip = 0
    found = []
    while True:
        res = await one_c_service.fetch_nomenclatura(top=1000, skip=skip, is_folder=False)
        if not res:
            break
        for p in res:
            desc = p.get('Description', '').lower()
            name = p.get('НаименованиеПолное', '').lower()
            if 'comfort' in desc or 'комфорт' in desc or 'comfort' in name or 'комфорт' in name:
                found.append(p)
        skip += 1000
        print(f"Scanned {skip} products...")
        
    print(f"\nFound {len(found)} products matching 'comfort':")
    for p in found:
        print(f"Name: {p.get('Description')} (Ref: {p.get('Ref_Key')})")
        
if __name__ == "__main__":
    asyncio.run(main())
