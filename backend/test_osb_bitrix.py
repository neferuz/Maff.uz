import asyncio
import os
import aiohttp
from dotenv import load_dotenv
import json

load_dotenv()

BITRIX_URL = os.getenv("BITRIX_WEBHOOK_URL")

async def main():
    async with aiohttp.ClientSession() as session:
        url = f"{BITRIX_URL}crm.product.list.json"
        payload = {
            "filter": {"NAME": "%OSB%"},
            "select": ["ID", "NAME", "PREVIEW_PICTURE", "DETAIL_PICTURE"]
        }
        async with session.post(url, json=payload) as resp:
            data = await resp.json()
            products = data.get("result", [])
            print(f"Found {len(products)} products with OSB in Bitrix.")
            for p in products:
                print(f"{p['ID']}: {p['NAME']}")
                if "PREVIEW_PICTURE" in p and p["PREVIEW_PICTURE"]:
                    print(f"  PREVIEW_PICTURE: {json.dumps(p['PREVIEW_PICTURE'])}")
                if "DETAIL_PICTURE" in p and p["DETAIL_PICTURE"]:
                    print(f"  DETAIL_PICTURE: {json.dumps(p['DETAIL_PICTURE'])}")
asyncio.run(main())
