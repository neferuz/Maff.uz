import asyncio
from app.services.one_c import one_c_service

async def main():
    print("Fetching 1C nomenclature folders...")
    folders = []
    skip = 0
    while True:
        res = await one_c_service.fetch_nomenclatura(top=1000, skip=skip, is_folder=True)
        if not res:
            break
        folders.extend(res)
        skip += 1000

    egger_comfort_key = None
    for f in folders:
        if "comfort" in f.get("Description", "").lower():
            print(f"Found folder: {f['Description']} with Ref_Key: {f['Ref_Key']}")
            egger_comfort_key = f['Ref_Key']
            
    if not egger_comfort_key:
        print("Folder not found.")
        return
        
    print(f"\nFetching products in folder {egger_comfort_key}...")
    products = []
    skip = 0
    while True:
        res = await one_c_service.fetch_nomenclatura(top=1000, skip=skip, is_folder=False)
        if not res:
            break
        # filter those in egger_comfort_key
        for p in res:
            if p.get("Parent_Key") == egger_comfort_key:
                products.append(p)
        skip += 1000
        
    print(f"Found {len(products)} products in EGGER comfort folder.")
    for p in products:
        print(f"Name: {p.get('Description')} (Ref: {p.get('Ref_Key')})")
        
    # check if they have prices
    print("\nFetching prices...")
    prices = await one_c_service.fetch_prices()
    price_dict = {p['Номенклатура_Key']: p['Цена'] for p in prices}
    for p in products:
        key = p.get('Ref_Key')
        price = price_dict.get(key)
        print(f"{p.get('Description')}: price {price}")

if __name__ == "__main__":
    asyncio.run(main())
