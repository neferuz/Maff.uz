import asyncio
import httpx
from app.services.one_c import one_c_service

async def main():
    # fetch all nomenclatura that matches Antique 7303
    url = f"{one_c_service.base_url}Catalog_Номенклатура"
    params = {
        "$format": "json",
        "$filter": "substringof('Antique', Description)",
        "$top": 10
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(url, headers=one_c_service.headers, params=params)
        data = response.json()
        for item in data.get("value", []):
            name = item.get("Description")
            ref = item.get("Ref_Key")
            print(f"Found: {name}, Ref: {ref}")
            
            # Fetch price
            url_price = f"{one_c_service.base_url}InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast()"
            params_price = {
                "$format": "json",
                "$filter": f"Номенклатура_Key eq guid'{ref}' and ВидЦены_Key eq guid'6f2700d6-942a-11e9-80d0-fe35b4ce810f'"
            }
            res_price = await client.get(url_price, headers=one_c_service.headers, params=params_price)
            p_data = res_price.json()
            if p_data.get("value"):
                print("Price:", p_data["value"][0]["Цена"])
            else:
                print("No price")

asyncio.run(main())
