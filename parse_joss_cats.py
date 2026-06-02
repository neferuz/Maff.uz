import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://jossbeaumont.ru/catalog/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Look for links that contain 'kollektsiya'
        links = soup.find_all('a', href=lambda h: h and '/catalog/kollektsi' in h)
        collections = list(set([a['href'] for a in links]))
        print(f"Found {len(collections)} collections.")
        for c in collections:
            print(c)

asyncio.run(main())
