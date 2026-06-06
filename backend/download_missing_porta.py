import requests
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

links = [
    ("Порта-50.1 4AB ПП White Oak", "https://odk.by/wp-content/uploads/2024/12/%D0%9F%D0%BE%D1%80%D1%82%D0%B0-50.1-4AB-White-Oak.jpg"),
    ("Порта-50.1 4AB ПП Grey Oak", "https://odk.by/wp-content/uploads/2024/12/%D0%9F%D0%BE%D1%80%D1%82%D0%B0-50.1-4AB-Grey-Oak.jpg"),
    ("Порта-62 Cappuccino Veralinga", "https://t-dveri.by/image/catalog/elporta/mezhkomnatnye-dveri/porta-c/porta-62-cappuccino-veralinga.jpg"),
    ("Порта-62 Wenge Veralinga", "https://elporta.by/storage/products/original/porta-62-wenge-veralinga.jpg"),
    ("Порта-62 Alaska", "https://fastdoor.by/thumb/2/thJHysF48tYJLg3ExhGiIg/500r500/d/elporta_emalit_porta_62_alaska.jpg")
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
            filename = f"porta_missing_{safe_name}.jpg"
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

async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name, db_path in downloaded_mappings:
            # Build search query resilient to missing "ПП" or extra words
            parts = name.split()
            base = parts[0] # Порта-50.1 or Порта-62
            color = " ".join(parts[2:]) if len(parts) > 2 else parts[1]
            if "White Oak" in name: color = "White Oak"
            if "Grey Oak" in name: color = "Grey Oak"
            if "Cappuccino Veralinga" in name: color = "Cappuccino Veralinga"
            if "Wenge Veralinga" in name: color = "Wenge Veralinga"
            if "Alaska" in name: color = "Alaska"
            
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '{base}%' AND name ILIKE '%{color}%';"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{name}': {result.rowcount} rows")

if downloaded_mappings:
    asyncio.run(update_db())

