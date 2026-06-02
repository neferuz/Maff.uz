import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://jossbeaumont.ru/catalog/kollektsiya_liberte/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        items = soup.find_all('div', class_='product-item-image-wrapper')
        if not items:
            # Let's just find the links we found before
            links = soup.find_all('a', href=lambda h: h and '/catalog/kollektsiya_liberte/' in h and len(h) > len('/catalog/kollektsiya_liberte/'))
            for a in links[:1]:
                # Print all images inside the 'a' tag or its parent 'div.product-item'
                parent = a.find_parent(class_='product-item')
                if parent:
                    imgs = parent.find_all('img')
                    print("Images in product-item:")
                    for i in imgs:
                        print(i.get('src'))
                        
                else:
                    imgs = a.find_all('img')
                    print("Images in a tag:")
                    for i in imgs:
                        print(i.get('src'))

asyncio.run(main())
