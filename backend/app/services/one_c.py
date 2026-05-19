import httpx
from typing import List, Dict, Any
from app.core.config import settings

class OneCService:
    def __init__(self):
        self.base_url = settings.ONE_C_BASE_URL
        self.headers = {
            "X-API-TOKEN": settings.ONE_C_API_TOKEN,
            "Accept": "application/json"
        }

    async def fetch_nomenclatura(self, top: int = 1000, skip: int = 0, is_folder: bool = None) -> List[Dict[str, Any]]:
        url = f"{self.base_url}Catalog_Номенклатура"
        params = {
            "$format": "json",
            "$top": top,
            "$skip": skip,
            "$select": "Ref_Key,Description,НаименованиеПолное,Артикул,IsFolder,Parent_Key,ФайлКартинки_Key"
        }
        if is_folder is not None:
            params["$filter"] = f"IsFolder eq {'true' if is_folder else 'false'}"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("value", [])

    async def fetch_stock(self) -> List[Dict[str, Any]]:
        """
        Fetch current stock balances with Warehouse key.
        """
        url = f"{self.base_url}AccumulationRegister_СвободныеОстатки/Balance()"
        params = {
            "$format": "json",
            "$select": "Номенклатура_Key,Склад_Key,ВНаличииBalance"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("value", [])

    async def fetch_warehouses(self) -> List[Dict[str, Any]]:
        """
        Fetch warehouses catalog.
        """
        url = f"{self.base_url}Catalog_Склады"
        params = {
            "$format": "json",
            "$select": "Ref_Key,Description"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("value", [])

    async def fetch_prices(self, price_type_uuid: str = "6f2700d6-942a-11e9-80d0-fe35b4ce810f") -> List[Dict[str, Any]]:
        """
        Fetch latest prices for a specific price type.
        Default is 'Магазин'.
        """
        url = f"{self.base_url}InformationRegister_ЦеныНоменклатуры_RecordType/SliceLast()"
        params = {
            "$format": "json",
            "$filter": f"ВидЦены_Key eq guid'{price_type_uuid}'",
            "$select": "Номенклатура_Key,Цена"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("value", [])


one_c_service = OneCService()
