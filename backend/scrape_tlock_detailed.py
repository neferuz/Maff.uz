import asyncio
import httpx
from bs4 import BeautifulSoup
import re

queries = [
    "R.URS52.AQUA",
    "R.LD54.Columba",
    "K.QR52.BLADE",
    "Fly Fuaro"
]

async def scrape_query(client, q):
    url = f"https://tlock.ru/search/?q={q}"
    try:
        resp = await client.get(url, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            print(f"\n=== Query: {q} ===")
            # Find all product links and their images
            # Let's find divs with classes like "product-card", "item", etc., or just list all img tags that look like product photos
            # Product photos usually live in /upload/iblock/ and have longer hashes or name in the path
            for img in soup.find_all("img"):
                src = img.get("src") or ""
                alt = img.get("alt") or ""
                # Skip small icons, banners, payment logos
                if "/upload/iblock/" in src:
                    if any(x in src.lower() for x in ["pay", "logo", "banner", "icon", "ap2", "basket", "wish"]):
                        continue
                    # Check if the filename contains letters/numbers or alt is relevant
                    print(f"  Alt: '{alt}' | Src: https://tlock.ru{src}")
    except Exception as e:
        print(f"Query: {q} | Error: {e}")

async def main():
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        for q in queries:
            await scrape_query(client, q)

if __name__ == "__main__":
    asyncio.run(main())
