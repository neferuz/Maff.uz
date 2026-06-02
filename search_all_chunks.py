import asyncio
import httpx
import re

async def download_and_search(client, chunk_name):
    url = f"https://client-site.s3.yandex.net/r19640913/_next/static/chunks/{chunk_name}"
    try:
        res = await client.get(url)
        if res.status_code == 200:
            js = res.text
            # Search for URLs
            urls = re.findall(r'\"(https?://[^\"]+)\"', js)
            print(f"Chunk {chunk_name}: len={len(js)} | URLs found: {len(urls)}")
            for u in set(urls):
                if "yandex" in u or "api" in u or "maps" in u:
                    print(f"  {u}")
            
            # Search for relative paths
            paths = re.findall(r'\"(/[a-zA-Z0-9_/.-]+)\"', js)
            for p in set(paths):
                if any(k in p.lower() for k in ["goods", "services", "api", "products", "items", "catalog"]):
                    print(f"  path: {p}")
    except Exception as e:
        print(f"Error chunk {chunk_name}: {e}")

async def main():
    chunks = [
        "1255-aed1538840402354.js",
        "2850-6c42318db785c3b0.js",
        "6961-1f1d293adcf1e8ee.js",
        "8712-7edcc46879bfc3c5.js",
        "c16f53c3-e86ef93545afdc09.js",
        "5314-7368a5ede2f7e235.js"
    ]
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        for chunk in chunks:
            await download_and_search(client, chunk)

asyncio.run(main())
