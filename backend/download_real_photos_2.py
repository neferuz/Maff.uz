import requests
from bs4 import BeautifulSoup
import urllib.parse
import os

urls = [
    ("classico_33_v2", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpo-pp-klassiko-33-alaska-white-srystal-sizetp-200x60/"),
    ("classico_83_v2", "https://mdoor.by/product/klassiko-83-alaska-white-crystal"),
    ("classico_83_v3", "https://portika.ru/mezhkomnatnyie-dveri/polipropilen-%28monochrome%29/seriya-classico/klassiko-83?modification=418")
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
        
        img_tag = None
        # mdoor.by and portika.ru
        for selector in ['.product-image img', '.main-image img', '.owl-item img', '.product-gallery__image img', '.detail-gallery-preview img']:
            img_tag = soup.select_one(selector)
            if img_tag and img_tag.get('src') and 'logo' not in img_tag.get('src').lower():
                break
                
        if not img_tag:
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and ('upload' in src or 'images' in src or 'product' in src) and not src.endswith('.svg') and 'logo' not in src.lower():
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

