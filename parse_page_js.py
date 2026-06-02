import asyncio
import httpx
import re

async def main():
    url = "https://client-site.s3.yandex.net/r19640913/_next/static/chunks/app/page-08ce5b3ef55ef0b0.js"
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        res = await client.get(url)
        js = res.text
        print(f"Downloaded JS file length: {len(js)}")
        
        # Let's search for potential API endpoints or URLs
        urls = re.findall(r'\"(https?://[^\"]+)\"', js)
        print(f"Found URLs in JS: {len(urls)}")
        for u in set(urls):
            if "yandex" in u or "api" in u:
                print(f"  {u}")
                
        # Search for relative paths
        paths = re.findall(r'\"(/[a-zA-Z0-9_/.-]+)\"', js)
        print(f"Found relative paths: {len(paths)}")
        for p in set(paths):
            if "api" in p or "goods" in p or "products" in p:
                print(f"  {p}")

        # Search for headers, search terms, or queries
        keywords = ["fetch", "axios", "request", "http", "api", "goods", "catalog", "products"]
        for kw in keywords:
            matches = [m.start() for m in re.finditer(kw, js, re.IGNORECASE)]
            print(f"Keyword '{kw}' matches: {len(matches)}")
            
        # Write JS to a file to search locally if needed
        with open("page_script.js", "w", encoding="utf-8") as f:
            f.write(js)

asyncio.run(main())
