import requests
from bs4 import BeautifulSoup
import urllib.parse
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

links = [
    ("Классико-12 ПП Alaska", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpg-pp-klassiko-12-alaska/"),
    ("Классико-12 ПП Grey Oak", "https://domdverei.ru/product/mezhkomnatnaya-dver-classico-12-grey-oak/"),
    ("Классико-12.3 ЭКО Light Sonoma", "https://dveri.by/katalog/mezhkomnatnye-dveri/ekoshpon/elporta/ekoshpon/seriya-classico/klassiko-12.3-light-sonoma"),
    ("Классико-13 ПП Alaska White Сrystal", "https://elporta.by/catalog/mezhkomnatnye-dveri/polipropilen-monochrome/classico/klassiko-13-alaska-white-crystal"),
    ("Классико-13 ПП Grey Oak White Crystal", "https://new-design.by/shop/mezhkomnatnye-dveri/polipropilen-elporta-monochrome/classico-monochrome/klassiko-13-nardo-grey-white-crystal/"),
    ("Классико-13.31 ЭКО Light Sonoma Milling White II", "https://odk.by/product/%D0%BA%D0%BB%D0%B0%D1%81%D1%81%D0%B8%D0%BA%D0%BE-13-31-light-sonoma-milling-white-ii/"),
    ("Классико-33 ПП Grey Oak White Сrystal", "https://dverimebel.by/p114971328-klassiko-nordic-oak.html")
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
        for selector in ['.product-gallery__image img', '.main-image img', '.product-image img', '.detail-gallery-preview img', '.owl-item img', '.woocommerce-product-gallery__image img']:
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

async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("\nSQL Updates:")
        for name, path in results:
            # name processing for ILIKE: escape or clean up
            search_name = name.replace("С", "_") # handle Cyrillic C issues
            sql = f"UPDATE product SET image_url = '{path}', is_active = true WHERE name ILIKE '%{name[:10]}%' AND name ILIKE '%{name[-8:].replace('Crystal', '%').replace('Сrystal', '%')}%' AND category_id = 426;"
            print(sql)
            res = await conn.execute(text(sql))
            print(f"Updated {res.rowcount} rows for {name}")

asyncio.run(update_db())

