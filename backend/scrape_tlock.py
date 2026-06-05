import asyncio
import httpx
from bs4 import BeautifulSoup

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
            # Look for catalog images or search result images
            images = []
            for img in soup.find_all("img"):
                src = img.get("src") or ""
                alt = img.get("alt") or ""
                if "/upload/" in src:
                    images.append((alt, f"https://tlock.ru{src}"))
            print(f"Query: {q} | Found {len(images)} images:")
            for alt, src in images[:3]:
                print(f"  - '{alt}' -> {src}")
            return q, images
    except Exception as e:
        print(f"Query: {q} | Error: {e}")
    return q, []

async def main():
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
        tasks = [scrape_query(client, q) for q in queries]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
