import asyncio
import asyncpg
import httpx

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    uncat = await conn.fetch("SELECT id, name, sku, ref_key FROM product WHERE category_id IS NULL LIMIT 5")
    
    base_url = "https://api.eman.uz/api/odata/palisandr_fresh/"
    headers = {
        "X-API-TOKEN": "XKtjqpkmy56WsLD63NvVOCXp4FyTuuqju0GoAhpElBzFHikN",
        "Accept": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for p in uncat:
            ref_key = p['ref_key']
            print(f"\nProduct: {p['name']} ({ref_key})")
            url = f"{base_url}Catalog_Номенклатура(guid'{ref_key}')?$format=json"
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                print("Parent_Key:", data.get('Parent_Key'))
            else:
                print("Failed to get 1C data", res.status_code)
                
    await conn.close()

asyncio.run(main())
