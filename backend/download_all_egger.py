import asyncio
import aiohttp
import os
import re
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

SAVE_DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/egger'
os.makedirs(SAVE_DIR, exist_ok=True)

# Direct JPG links from user
DIRECT_LINKS = {
    'EHL038': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl038_enl1.jpg',
    'EHL122': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl122_enl1.jpg',
    'EHL204': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl204_enl1.jpg',
    'EHL105': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl105_enl1.jpg',
    'EHL145': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl145_enl1.jpg',
    'EHL238': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl238.jpg',
    'EHL211': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl211_enl1.jpg',
    'EHL247': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl247.jpg',
    'EHL016': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl016_enl1.jpg',
    'EHL240': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/ehl240.jpg',
    'EHL135': 'https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/EHL135_enl1.jpg',
}

# Try dostroydom pattern for ALL missing ones
ALL_EHL_CODES = [
    'EHL038', 'EHL105', 'EHL145', 'EHL236', 'EHL238', 'EHL239',
    'EHL111', 'EHL146', 'EHL159', 'EHL233', 'EHL234', 'EHL235',
    'EHL135', 'EHL185', 'EHL039', 'EHL098', 'EHL194', 'EHL247',
    'EHL014', 'EHL015', 'EHL016', 'EHL017', 'EHL032', 'EHL103',
    'EHL120', 'EHL122', 'EHL140', 'EHL201', 'EHL204', 'EHL211',
    'EHL225', 'EHL240', 'EHL241', 'EHL242',
]

async def download_image(session, url, filepath):
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15), allow_redirects=True) as resp:
            if resp.status == 200:
                ct = resp.headers.get('Content-Type', '')
                data = await resp.read()
                if len(data) > 2000 and ('image' in ct or filepath.endswith('.jpg')):
                    with open(filepath, 'wb') as f:
                        f.write(data)
                    return True
    except Exception as e:
        pass
    return False

async def main():
    engine = create_async_engine(db_url)
    
    async with aiohttp.ClientSession(headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }) as session:
        downloaded = {}
        
        # 1. Download direct links first
        for code, url in DIRECT_LINKS.items():
            filepath = os.path.join(SAVE_DIR, f"{code.lower()}.jpg")
            if os.path.exists(filepath) and os.path.getsize(filepath) > 2000:
                print(f"✓ Already have {code}")
                downloaded[code] = filepath
                continue
            if await download_image(session, url, filepath):
                print(f"✓ Downloaded {code} from direct link")
                downloaded[code] = filepath
            else:
                print(f"✗ Failed direct link for {code}")
        
        # 2. Try dostroydom pattern for all remaining
        for code in ALL_EHL_CODES:
            if code in downloaded:
                continue
            filepath = os.path.join(SAVE_DIR, f"{code.lower()}.jpg")
            if os.path.exists(filepath) and os.path.getsize(filepath) > 2000:
                print(f"✓ Already have {code}")
                downloaded[code] = filepath
                continue
            
            # Try multiple URL patterns
            urls = [
                f"https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/{code.lower()}_enl1.jpg",
                f"https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/{code.lower()}.jpg",
                f"https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/{code}_enl1.jpg",
                f"https://dostroydom.by/published/publicdata/BYCHKOSERGEI1DOSTROY/attachments/SC/products_pictures/{code}.jpg",
            ]
            found = False
            for url in urls:
                if await download_image(session, url, filepath):
                    print(f"✓ Downloaded {code} from pattern: {url}")
                    downloaded[code] = filepath
                    found = True
                    break
            if not found:
                print(f"✗ Could not find {code} on dostroydom")
        
        print(f"\nTotal downloaded: {len(downloaded)}")
        
        # 3. Update DB
        async with engine.begin() as conn:
            res = await conn.execute(text("""
                SELECT id, name FROM product 
                WHERE category_id IN (397, 414, 101, 1)
                AND is_active = True 
                AND (image_url IS NULL OR image_url = '')
                AND name LIKE '%EHL%'
            """))
            products = res.fetchall()
            
            updated = 0
            for p in products:
                match = re.search(r'EHL(\d+)', p[1])
                if match:
                    code = f"EHL{match.group(1)}"
                    if code in downloaded:
                        db_path = f"/static/uploads/egger/{code.lower()}.jpg"
                        await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": p[0]})
                        print(f"  DB updated: ID={p[0]} -> {db_path}")
                        updated += 1
            
            print(f"\nUpdated {updated} products in DB!")

asyncio.run(main())
