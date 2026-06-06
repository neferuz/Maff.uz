import requests
from bs4 import BeautifulSoup
import urllib.parse
import os

urls = [
    ("classico_32_grey_oak", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-32-grey-oak/"),
    ("classico_33_grey_oak", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-33-grey-oak-white-crystal/"),
    ("classico_12_grey_oak", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-12-grey-oak/"),
    ("classico_13_grey_oak", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-13-grey-oak-white-crystal/"),
    ("classico_12_3_sonoma", "https://portika-spb.ru/mezhkomnatnye-dveri/jeko-shpon-unilin/klassiko-12-3-light-sonoma/"),
    ("classico_13_31_sonoma", "https://portika-spb.ru/mezhkomnatnye-dveri/jeko-shpon-unilin/klassiko-13-31-light-sonoma-milling-white-2/")
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
        for selector in ['.product-image img', '.main-image img', '.owl-item img', '.product-gallery__image img']:
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
            
            filename = f"{name}.{ext}"
            filepath = os.path.join(out_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(img_r.content)
            print(f"Saved to {filepath}")
        else:
            print(f"Could not find main image for {url}")
    except Exception as e:
        print(f"Error: {e}")

