import requests
import os
import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

links = [
    ("Классико-12.3 ЭКО Light Sonoma", "https://odk.by/wp-content/uploads/2024/06/%D0%9A%D0%BB%D0%B0%D1%81%D1%81%D0%B8%D0%BA%D0%BE-12.3-Light-Sonoma.jpg"),
    ("Классико-13.31 ЭКО Light Sonoma Milling White II", "https://odk.by/wp-content/uploads/2024/06/%D0%9A%D0%BB%D0%B0%D1%81%D1%81%D0%B8%D0%BA%D0%BE-13.31-Light-Sonoma-Milling-White-II.jpg"),
    ("Порта-25.3 Light Sonoma Magic Fog", "https://odk.by/wp-content/uploads/2024/06/%D0%9F%D0%BE%D1%80%D1%82%D0%B0-25.3-Light-Sonoma-Magic-Fog.jpg"),
    ("Порта-29.3 Light Sonoma Magic Fog", "https://elporta.by/storage/products/medium/66571ff11d4ed0.34474139.jpg")
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

downloaded_mappings = []

for name, url in links:
    print(f"Downloading: {name}")
    try:
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            safe_name = name.lower().replace(" ", "_").replace(".", "_").replace("-", "_")
            safe_name = "".join(c for c in safe_name if c.isalnum() or c == "_")
            filename = f"missing_{safe_name}.jpg"
            filepath = os.path.join(out_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(res.content)
            
            db_path = f"/static/uploads/doors/{filename}"
            downloaded_mappings.append((name, db_path))
            print(f"  Saved to {filename}")
        else:
            print(f"  Failed: HTTP {res.status_code}")
    except Exception as e:
        print(f"  Error: {e}")

async def process_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name, db_path in downloaded_mappings:
            if "Классико" in name:
                # Update existing ones
                # Need to use ILIKE because of trailing sizes
                search_name = name.replace("ЭКО ", "%")
                sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '{search_name}%';"
                result = await conn.execute(text(sql))
                print(f"Updated {result.rowcount} rows for '{name}'")
            elif "Порта" in name:
                # Create new ones since they don't exist
                ref_key = str(uuid.uuid4())
                sql = text("""
                    INSERT INTO product 
                    (name, price, stock, ref_key, is_active, category_id, brand, country, image_url, specifications, in_stock) 
                    VALUES 
                    (:name, 0.0, 0.0, :ref_key, true, 428, 'Portika', 'Россия', :image_url, '{}'::jsonb, 0)
                """)
                await conn.execute(sql, {
                    "name": name,
                    "ref_key": ref_key,
                    "image_url": db_path
                })
                print(f"Created new product '{name}' with price 0.0")

if downloaded_mappings:
    asyncio.run(process_db())
