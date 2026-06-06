import os
import asyncio
import uuid
import requests
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

urls = [
    ("Порта-1 ПП Alaska", "https://elporta.by/storage/products/medium/64075fcf87abc0.88271030.jpg"),
    ("Порта-1 ПП Nardo Grey", "https://elporta.by/storage/products/medium/64075fd591fe32.13002312.jpg"),
    ("Порта-50 4AB Эксимер Keramik Valse (Черный: М) Стандарт", "https://elporta.by/storage/products/medium/682cd6664eb850.63890558.jpg"),
    ("Порта-50 4AB Эксимер Keramik Brown (Черный: М) Стандарт", "https://elporta.by/storage/products/medium/682cdc2b7ba580.72966584.jpg"),
    ("Порта-50.1 4AB ПП Natural Oak", "https://elporta.by/storage/products/original/6748d02d805f90.66015573.jpg"),
    ("Порта-50 B ПП Rocks Beige", "https://elporta.by/storage/products/medium/68dfbc5e934744.31256183.jpg"),
    ("Порта-50 B ПП Rocks Pearl", "https://elporta.by/storage/products/medium/68dfbc585fe3a5.66017666.jpg"),
    ("Порта-50.11 4AB ПП Alpik Oak", "https://alfadveri.by/assets/images/products/361/img7b17.tmp.jpg"),
    ("Порта-51 4AB ПП Alaska Black Star", "https://elporta.by/storage/products/medium/6627ad35b4dd51.45981791.jpg"),
    ("Порта-50 4AB Эксимер Keramik Valse (Черный: М) Нестандарт", "https://elporta.by/storage/products/medium/682cd6664eb850.63890558.jpg"),
    ("Порта-50 4AB Эксимер Keramik Brown (Черный: М) Нестандарт", "https://elporta.by/storage/products/medium/682cdc2b7ba580.72966584.jpg"),
    ("Порта-51 4AB ПП Alpik Oak Black Star", "https://elporta.by/storage/products/medium/66fe9b7ed69867.91536893.jpeg"),
    ("Порта-50.10 B ПП Rocks Beige", "https://elporta.by/storage/products/medium/68dfbc4c7b3476.73644521.jpg"),
    ("Порта-50.10 B ПП Rocks Pearl", "https://elporta.by/storage/products/medium/68dfbc436c3cd1.17481033.jpg")
]

# Note: "Порта-58 4AB ПП Grey Oak" was in the summary but no link provided.
# We will keep it active.
allowed_models = [
    "Порта-1 ПП Alaska",
    "Порта-1 ПП Nardo Grey",
    "Порта-50 4AB Эксимер Keramik Valse",
    "Порта-50 4AB Эксимер Keramik Brown",
    "Порта-50.1 4AB ПП Natural Oak",
    "Порта-50 B ПП Rocks Beige",
    "Порта-50 B ПП Rocks Pearl",
    "Порта-50.11 4AB ПП Alpik Oak",
    "Порта-51 4AB ПП Alaska Black Star",
    "Порта-51 4AB ПП Alpik Oak Black Star",
    "Порта-50.10 B ПП Rocks Beige",
    "Порта-50.10 B ПП Rocks Pearl",
    "Порта-58 4AB ПП Grey Oak"
]

headers = {'User-Agent': 'Mozilla/5.0'}

async def main():
    engine = create_async_engine(db_url)
    
    # 1. Download images
    downloaded = []
    for name, url in urls:
        print(f"Downloading: {name}")
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                safe_name = name.lower().replace(" ", "_").replace(".", "_").replace("-", "_").replace("(", "").replace(")", "").replace(":", "")
                filename = f"final_{safe_name}.jpg"
                filepath = os.path.join(out_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(res.content)
                db_path = f"/static/uploads/doors/{filename}"
                downloaded.append((name, db_path))
                print(f"  Saved to {filename}")
            else:
                print(f"  Failed HTTP {res.status_code}")
        except Exception as e:
            print(f"  Error: {e}")

    async with engine.begin() as conn:
        # 2. First, deactivate everything in Porta
        await conn.execute(text("UPDATE product SET is_active = false WHERE category_id = 428;"))
        print("Deactivated all Porta products.")

        # 3. Reactivate the allowed models and update images
        for allowed in allowed_models:
            # We match by the substring. This will cover Standart/Nestandart and (Черный: М)
            search = f"%{allowed}%"
            res = await conn.execute(text("UPDATE product SET is_active = true WHERE category_id = 428 AND name ILIKE :search;"), {"search": search})
            if res.rowcount == 0:
                print(f"WARNING: Could not find any product matching '{allowed}' to reactivate!")
            else:
                print(f"Reactivated {res.rowcount} products for '{allowed}'")
                
        # 4. Update image URLs for downloaded ones
        for name, path in downloaded:
            search = f"%{name}%"
            # Some names have (Черный: М) in them, some don't.
            res = await conn.execute(text("UPDATE product SET image_url = :path WHERE category_id = 428 AND name ILIKE :search;"), {"path": path, "search": search})
            if res.rowcount == 0:
                # Try without the Standart/Nestandart and (Черный: М)
                short_name = name.replace(" Стандарт", "").replace(" Нестандарт", "").replace(" (Черный: М)", "")
                search = f"%{short_name}%"
                res2 = await conn.execute(text("UPDATE product SET image_url = :path WHERE category_id = 428 AND name ILIKE :search;"), {"path": path, "search": search})
                print(f"Updated {res2.rowcount} images using short name '{short_name}'")

asyncio.run(main())
