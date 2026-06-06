import asyncio
import subprocess
import re
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/sargo'
os.makedirs(DIR, exist_ok=True)

ITEMS = [
    ("5241", "https://sargogroup.com/ru/catalog/carpet-tile/ember-stripe-pct-5241"),
    ("5376", "https://sargogroup.com/ru/catalog/carpet-tile/indigo-haze-pct-5376"),
    ("6923", "https://sargogroup.com/ru/catalog/carpet-tile/sage-linen-pct-6923"),
    ("6957", "https://sargogroup.com/ru/catalog/carpet-tile/silver-mist-pct-6957"),
    ("3644", "https://sargogroup.com/ru/catalog/carpet-tile/umber-brassline-pct-3644"),
    ("4144", "https://sargogroup.com/ru/catalog/carpet-tile/copper-weave-pct-4144"),
    ("5236", "https://sargogroup.com/ru/catalog/carpet-tile/amber-trace-pct-5236"),
    ("5253", "https://sargogroup.com/ru/catalog/carpet-tile/cobalt-stripe-pct-5253"),
    ("5269", "https://sargogroup.com/ru/catalog/carpet-tile/shadow-graphite-pct-5269"),
    ("5276", "https://sargogroup.com/ru/catalog/carpet-tile/arctic-current-pct-5276"),
]

def fetch(url):
    r = subprocess.run(['curl', '-sL', url, '-H', 'User-Agent: Mozilla/5.0'], capture_output=True, text=True, timeout=15)
    return r.stdout

def dl(url, path):
    subprocess.run(['curl', '-sL', '-o', path, url, '-H', 'User-Agent: Mozilla/5.0'], timeout=30)
    if os.path.exists(path):
        sz = os.path.getsize(path)
        r = subprocess.run(['file', '-b', path], capture_output=True, text=True)
        if sz > 5000 and 'image' in r.stdout.lower():
            return sz
        os.remove(path)
    return 0

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for code, url in ITEMS:
            res = await conn.execute(text("SELECT id FROM product WHERE name ILIKE :name"), {"name": f"%{code}%"})
            rows = res.fetchall()
            if not rows:
                print(f"No active products for {code}")
                continue
            
            slug = url.strip('/').split('/')[-1]
            filepath = os.path.join(DIR, f"{slug}.jpg")
            db_path = f"/static/uploads/sargo/{slug}.jpg"
            
            if not (os.path.exists(filepath) and os.path.getsize(filepath) > 5000):
                print(f"Fetching {code} from {url}")
                html = fetch(url)
                # find image in sargogroup html: usually something like /upload/iblock/... or <meta property="og:image" content="..."
                og_image = re.search(r'property="og:image" content="([^"]+)"', html)
                img_url = None
                if og_image:
                    img_url = og_image.group(1)
                    if img_url.startswith('/'):
                        img_url = f"https://sargogroup.com{img_url}"
                else:
                    imgs = re.findall(r'src="(https?://sargogroup\.com/upload/[^"]+\.jpg)"', html)
                    if not imgs:
                        imgs = re.findall(r'src="(/upload/iblock/[^"]+\.jpg)"', html)
                        if imgs:
                            img_url = f"https://sargogroup.com{imgs[0]}"
                
                if img_url:
                    sz = dl(img_url, filepath)
                    if sz > 0:
                        print(f"  ✓ Downloaded {sz} bytes from {img_url}")
                    else:
                        print(f"  ✗ Failed to download image for {code}")
                        continue
                else:
                    print(f"  ✗ No image URL found for {code}")
                    continue
            
            if os.path.exists(filepath):
                for r in rows:
                    await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": r[0]})
                    print(f"  ✓ DB updated for {code} (ID: {r[0]})")

asyncio.run(main())
