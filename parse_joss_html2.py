import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://jossbeaumont.ru/catalog/kollektsiya_liberte/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Let's try to find elements with class containing 'item' or 'card'
        items = soup.find_all('a', href=lambda h: h and '/catalog/kollektsiya_liberte/' in h)
        print(f"Found {len(items)} links to products.")
        
        for a in items:
            img = a.find('img')
            if img and img.get('src'):
                print(f"Link: {a['href']}")
                print(f"Image: {img['src']}")
                
                # Check for adjacent text which might be the name/SKU
                parent = a.parent
                print("Text:", parent.text.strip()[:100].replace('\n', ' '))
                print('---')

asyncio.run(main())
