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

async def download_image(session, url, filepath):
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
            if resp.status == 200:
                data = await resp.read()
                if len(data) > 1000:
                    with open(filepath, 'wb') as f:
                        f.write(data)
                    return True
    except Exception as e:
        pass
    return False

async def main():
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        res = await conn.execute(text("""
            SELECT id, name FROM product 
            WHERE category_id IN (397, 414, 101)
            AND is_active = True 
            AND (image_url IS NULL OR image_url = '')
            AND name LIKE '%EHL%'
            ORDER BY name
        """))
        products = res.fetchall()
        print(f"Found {len(products)} EGGER products without photos")
    
    # Extract EHL codes
    ehl_products = []
    for p in products:
        match = re.search(r'EHL(\d+)', p[1])
        if match:
            ehl_code = f"EHL{match.group(1)}"
            ehl_products.append((p[0], p[1], ehl_code))
    
    print(f"Products with EHL codes: {len(ehl_products)}")
    
    # Try downloading from Egger website
    # Egger product images follow patterns like:
    # https://www.egger.com/dam/jcr:XXXX/EHL103.jpg
    # Let's try multiple URL patterns
    
    async with aiohttp.ClientSession(headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }) as session:
        updated = 0
        for pid, name, ehl_code in ehl_products:
            filepath = os.path.join(SAVE_DIR, f"{ehl_code.lower()}.jpg")
            
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                print(f"Already have {ehl_code}")
                db_path = f"/static/uploads/egger/{ehl_code.lower()}.jpg"
                async with engine.begin() as conn:
                    await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": pid})
                updated += 1
                continue
            
            # Try multiple URL patterns
            urls = [
                f"https://www.egger.com/o/decor-images/{ehl_code}_EPD_01.jpg",
                f"https://www.egger.com/o/decor-images/{ehl_code}_MU_01.jpg",
                f"https://dam.egger.com/m/7a00c07a4f63e33e/medium-{ehl_code}_EPD_01.jpg",
                f"https://dam.egger.com/m/7a00c07a4f63e33e/medium-{ehl_code}_MU_01.jpg",
            ]
            
            found = False
            for url in urls:
                if await download_image(session, url, filepath):
                    print(f"✓ Downloaded {ehl_code} from {url}")
                    db_path = f"/static/uploads/egger/{ehl_code.lower()}.jpg"
                    async with engine.begin() as conn:
                        await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": pid})
                    updated += 1
                    found = True
                    break
            
            if not found:
                print(f"✗ Could not find image for {ehl_code} ({name})")
        
        print(f"\nTotal updated: {updated}")

asyncio.run(main())
