import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://mirovoy-parquet.ru/catalog/napolnyie-pokryitiya/laminat/egger/eversense/laminat-egger-eversense-dub-kasella-naturalnyy-el2152"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
        res = await client.get(url)
        print(f"Status Code: {res.status_code}")
        print(f"Content Length: {len(res.text)}")
        
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Let's find all images on the page
        imgs = soup.find_all('img')
        print(f"Found {len(imgs)} images on the page.")
        for idx, img in enumerate(imgs):
            src = img.get('src')
            if src and ('/upload/' in src or 'laminat' in src or 'el2152' in src.lower()):
                print(f"Image {idx}: src={src} | alt={img.get('alt')}")

if __name__ == '__main__':
    asyncio.run(main())
