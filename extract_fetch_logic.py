import asyncio
import httpx
import re

async def main():
    url = "https://client-site.s3.yandex.net/r19640913/_next/static/chunks/3273-c4de1f024d94ccb6.js"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        js = res.text
        
        # Search for references to price lists or companies or permalink
        terms = ["pricelist", "price-list", "companies", "permalink", "catalog", "fetch"]
        for term in terms:
            matches = [m.start() for m in re.finditer(term, js, re.IGNORECASE)]
            print(f"Term '{term}': {len(matches)} matches")
            for m in matches[:5]:
                start = max(0, m - 150)
                end = min(len(js), m + 150)
                print(f"  [{term}] context: {repr(js[start:end])}")
                print("-" * 50)

asyncio.run(main())
