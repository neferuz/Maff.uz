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
    ("Неоклассико-12 Эксимер Keramik Beige", "https://elporta.by/catalog/mezhkomnatnye-dveri/ksimer/neoclassico/neoklassiko-12-keramik-beige"),
    ("Неоклассико-12 Эксимер Keramik Brown", "https://elporta.by/catalog/mezhkomnatnye-dveri/ksimer/neoclassico/neoklassiko-12-keramik-brown"),
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

downloaded_mappings = []

for name, url in links:
    print(f"Processing: {name}")
    try:
        res = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(res.text, 'html.parser')
        img_url = None
        
        domain = urllib.parse.urlparse(url).netloc
        
        imgs = soup.find_all('img')
        for img in imgs:
            src = img.get('src') or img.get('data-src') or ''
            if '/original/' in src:
                img_url = f"https://{domain}{src}"
                break
                
        if not img_url:
            print("  Could not find image URL.")
            continue
            
        print(f"  Found image: {img_url}")
        
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

async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name, db_path in downloaded_mappings:
            search_name = name.replace(" ", "%")
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%{search_name}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Неоклассико%');"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{name}': {result.rowcount} rows")

if downloaded_mappings:
    asyncio.run(update_db())

