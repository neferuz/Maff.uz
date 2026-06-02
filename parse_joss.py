import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://jossbeaumont.ru/catalog/kollektsiya_liberte/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        items = soup.select('.product-item')
        print(f"Found {len(items)} items on page.")
        for item in items[:5]:
            title_elem = item.select_one('.product-item-title a')
            if title_elem:
                print("Title:", title_elem.text.strip())
                print("Link:", title_elem['href'])
                
            img_elem = item.select_one('.product-item-image-original')
            if img_elem:
                # Sometimes images are background-image
                style = img_elem.get('style', '')
                print("Image style:", style)

asyncio.run(main())
