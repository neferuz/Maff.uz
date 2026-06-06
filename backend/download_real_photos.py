import requests
from bs4 import BeautifulSoup
import urllib.parse
import os

urls = [
    ("classico_33", "https://dverishop.ru/mezhkomnatnye-dveri/klassiko-33-white-crystal-alaska/"),
    ("classico_83", "https://dverishop.ru/mezhkomnatnye-dveri/dc-83-white-crystal-alaska/")
]

out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

for name, url in urls:
    print(f"Fetching {url}")
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # dverishop usually has a main image in something like <div class="product-gallery__image"><img src="...">
        img_tag = soup.select_one('.product-gallery__image img') or soup.select_one('.main-image img') or soup.select_one('.product-image img')
        if not img_tag:
            # just find the first big image
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and ('upload' in src or 'images' in src) and not src.endswith('.svg') and 'logo' not in src.lower():
                    img_tag = img
                    break
                    
        if img_tag and img_tag.get('src'):
            img_url = urllib.parse.urljoin(url, img_tag.get('src'))
            print(f"Found image URL: {img_url}")
            
            img_r = requests.get(img_url, headers=headers)
            img_r.raise_for_status()
            
            ext = img_url.split('.')[-1].split('?')[0]
            if len(ext) > 4: ext = 'jpg'
            
            filename = f"{name}_real.{ext}"
            filepath = os.path.join(out_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(img_r.content)
            print(f"Saved to {filepath}")
        else:
            print(f"Could not find main image for {url}")
    except Exception as e:
        print(f"Error: {e}")

