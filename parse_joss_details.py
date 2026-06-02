import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://jossbeaumont.ru/catalog/kollektsiya_liberte/milfey/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Look for the main image and gallery images
        # Usually they are in a slider or have 'fancybox' class or inside '.product-item-detail-slider-images'
        images = []
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if '/upload/' in src and ('iblock' in src or 'resize_cache' in src):
                # Sometimes thumbnails have resize_cache, main images have iblock
                images.append(src)
                
        # To avoid duplicates and logo/icons, we filter by something common to product images
        images = list(set([i for i in images if 'iblock' in i]))
        print(f"Found {len(images)} images: {images}")
        
asyncio.run(main())
