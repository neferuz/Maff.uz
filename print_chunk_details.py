import asyncio
import httpx
import re

async def main():
    url = "https://client-site.s3.yandex.net/r19640913/_next/static/chunks/8712-7edcc46879bfc3c5.js"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        js = res.text
        
        print("ALL URLs found in Chunk:")
        urls = re.findall(r'[\'\"`](https?://[^\'\"`]+)[\'\"`]', js)
        for u in set(urls):
            print(f"  {u}")
            
        print("\nALL relative paths or endpoints found in Chunk:")
        paths = re.findall(r'[\'\"`](/[a-zA-Z0-9_/.-]+)[\'\"`]', js)
        for p in set(paths):
            if any(k in p.lower() for k in ["goods", "services", "api", "products", "catalog", "org", "card"]):
                print(f"  {p}")

asyncio.run(main())
