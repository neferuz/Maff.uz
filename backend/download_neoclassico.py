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
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

links = [
    ("Неоклассико-2 PRO ЭКО Ice", "https://elporta.by/catalog/mezhkomnatnye-dveri/eko-shpon/neoclassico/neoklassiko-2-pro-ice"),
    ("Неоклассико-3 PRO ЭКО Ice Milling White II", "https://elporta.by/catalog/mezhkomnatnye-dveri/eko-shpon/neoclassico/neoklassiko-3-pro-ice-milling-white-ii"),
    ("Неоклассико-11 Эксимер Keramik Beige", "https://portika.ru/mezhkomnatnyie-dveri/eksimer-%28eximer%29/seriya-neoclassico/neo-11?modification=1078"),
    ("Неоклассико-11 ПП Alaska", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/neoclassico/dpg-pp-neoklassiko-11-alaska-sizetp-200x70/"),
    ("Неоклассико-11 ПП Nardo Grey", "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/neoclassico/dpg-pp-neoklassiko-11-nardo-grey-sizetp-190x60/"),
    ("Неоклассико-1 Флекс Эмаль Shellac Cream", "https://new-design.by/shop/mezhkomnatnye-dveri/elporta-fleks-emalyu/seriya-neoclassico-fleks-emal/neoklassiko-1-shellac-cream/"),
    ("Неоклассико-11 ПП Natural Oak", "https://www.portika.ru/mezhkomnatnyie-dveri/polipropilen-%28glossmatt%29/neoclassico/neo-11?modification=1047"),
    ("Неоклассико-11 Эксимер Keramik Brown", "https://portika.ru/mezhkomnatnyie-dveri/eksimer-%28eximer%29/seriya-neoclassico/neo-11?modification=1079"),
    ("Неоклассико-11 Флекс Эмаль Shellac White", "https://portika.ru/mezhkomnatnyie-dveri/fleksemal-%28flexemal%29/seriya-neoclassico/neo-11?modification=1051")
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
}

downloaded_mappings = []

for name, url in links:
    print(f"Processing: {name}")
    try:
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code != 200:
            print(f"  Failed: {res.status_code}")
            continue
            
        soup = BeautifulSoup(res.text, 'html.parser')
        img_url = None
        
        domain = urllib.parse.urlparse(url).netloc
        
        if "elporta.by" in domain:
            img = soup.select_one('.product-gallery__main img')
            if img: img_url = img.get('src') or img.get('data-src')
            if img_url and not img_url.startswith('http'):
                img_url = f"https://{domain}{img_url}"
                
        elif "portika.ru" in domain:
            img = soup.select_one('.product-slider__item img')
            if img: img_url = img.get('src') or img.get('data-src')
            if img_url and not img_url.startswith('http'):
                img_url = f"https://{domain}{img_url}"
                
        elif "169.ru" in domain:
            img = soup.select_one('.product-card__gallery img') or soup.select_one('.gallery__item img') or soup.select_one('meta[property="og:image"]')
            if img and img.name == 'meta':
                img_url = img.get('content')
            elif img:
                img_url = img.get('src') or img.get('data-src')
            if img_url and not img_url.startswith('http'):
                img_url = f"https://{domain}{img_url}"
                
        elif "new-design.by" in domain:
            img = soup.select_one('.woocommerce-product-gallery__image img')
            if img: img_url = img.get('src') or img.get('data-src')
            if img_url and not img_url.startswith('http'):
                img_url = f"https://{domain}{img_url}"
                
        if not img_url:
            print("  Could not find image URL in HTML.")
            continue
            
        print(f"  Found image: {img_url}")
        
        # Download image
        img_res = requests.get(img_url, headers=headers, timeout=15)
        if img_res.status_code == 200:
            safe_name = name.lower().replace(" ", "_").replace(".", "_").replace("-", "_")
            safe_name = "".join(c for c in safe_name if c.isalnum() or c == "_")
            filename = f"neoclassico_{safe_name}.jpg"
            filepath = os.path.join(out_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(img_res.content)
            
            db_path = f"/static/uploads/doors/{filename}"
            downloaded_mappings.append((name, db_path))
            print(f"  Saved to {filename}")
        else:
            print(f"  Failed to download image: {img_res.status_code}")
            
    except Exception as e:
        print(f"  Error: {e}")

# Database update
async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name, db_path in downloaded_mappings:
            search_name = name.split(" Milling")[0].split(" ")[0] + "%" + name.split(" ")[-1]
            # Precise search
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%{name}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Неоклассико%');"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{name}': {result.rowcount} rows")

if downloaded_mappings:
    asyncio.run(update_db())

