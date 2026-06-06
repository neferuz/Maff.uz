import requests
from bs4 import BeautifulSoup
import urllib.parse
import os

links = [
    ("Классико-12.2 Флекс Эмаль Shellac White", "https://portika-spb.ru/mezhkomnatnye-dveri/flexemal/klassiko-pta-12-2-shellac-white/"),
    ("Классико-13.1 Флекс Эмаль Shellac White Milling White I", "https://169.ru/mezhkomnatnye-dveri/pet/classico/dpo-fleks-emal-klassiko-131-shellac-white-milling-white-i/"),
    ("Классико-32 ПП Alaska", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpg-pp-klassiko-32-alaska/"),
    ("Классико-33 ПП Alaska White Сrystal", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpo-pp-klassiko-33-alaska-white-srystal-sizetp-200x60/"),
    ("Классико-42 ПП Alaska", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-42-alyaska/"),
    ("Классико-43 ПП Alaska White Сrystal", "https://elporta.by/catalog/mezhkomnatnye-dveri/polipropilen-monochrome/classico/klassiko-43-alaska-white-crystal"),
    ("Классико-42 ПП Nardo Grey", "https://dverishop.ru/mezhkomnatnye-dveri/klassiko-42-nardo-grey/"),
    ("Классико-43 ПП Nardo Grey White Сrystal", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-43-nardo-grej/"),
    ("Классико-42 ЭКО Ice", "https://odk.by/product/%D0%BA%D0%BB%D0%B0%D1%81%D1%81%D0%B8%D0%BA%D0%BE-42-ice/"),
    ("Классико-43 ЭКО Ice Milling White II", "https://elporta.by/catalog/mezhkomnatnye-dveri/eko-shpon/classico/klassiko-43-ice-milling-white-ii"),
    ("Классико-82 ПП Alaska", "https://portika-spb.ru/mezhkomnatnye-dveri/polipropilen-monochrome/klassiko-82-alyaska/"),
    ("Классико-83 ПП Alaska White Сrystal", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpo-pp-klassiko-83-alaska-white-srystal/")
]

out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

results = []

for name, url in links:
    print(f"Fetching {name} from {url}")
    try:
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        
        img_tag = None
        for selector in ['.product-gallery__image img', '.main-image img', '.product-image img', '.detail-gallery-preview img', '.owl-item img']:
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
            
            safe_name = "user_" + name.replace(" ", "_").replace(".", "_").replace("/", "_").replace("*", "_").lower()
            filename = f"{safe_name}.{ext}"
            filepath = os.path.join(out_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(img_r.content)
            print(f"Saved to {filepath}")
            results.append((name, f"/static/uploads/doors/{filename}"))
        else:
            print(f"Could not find main image for {url}")
    except Exception as e:
        print(f"Error: {e}")

print("\nSQL Updates:")
for name, path in results:
    sql = f"UPDATE product SET image_url = '{path}' WHERE name ILIKE '%{name}%' AND category_id = 426;"
    print(sql)

