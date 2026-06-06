import requests
from bs4 import BeautifulSoup
import urllib.parse
import os

url = "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpo-pp-klassiko-83-alaska-white-srystal/"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

print(f"Fetching {url}")
try:
    r = requests.get(url, headers=headers, timeout=10)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    
    img_tag = soup.select_one('.detail-gallery-preview img') or soup.select_one('.product-image img')
    if not img_tag:
        for img in soup.find_all('img'):
            src = img.get('src')
            if src and ('products' in src or 'upload' in src) and not src.endswith('.svg') and 'logo' not in src.lower() and 'banner' not in src.lower():
                img_tag = img
                break
                
    if img_tag and img_tag.get('src'):
        img_url = urllib.parse.urljoin(url, img_tag.get('src'))
        print(f"Found image URL: {img_url}")
        
        img_r = requests.get(img_url, headers=headers)
        img_r.raise_for_status()
        
        ext = img_url.split('.')[-1].split('?')[0]
        if len(ext) > 4: ext = 'jpg'
        
        filepath = os.path.join(out_dir, f"classico_83_v2_real.{ext}")
        
        with open(filepath, 'wb') as f:
            f.write(img_r.content)
        print(f"Saved to {filepath}")
    else:
        print(f"Could not find main image for {url}")
except Exception as e:
    print(f"Error: {e}")

