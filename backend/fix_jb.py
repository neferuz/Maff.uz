import asyncio
import subprocess
import re
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/jossbeaumont'
os.makedirs(DIR, exist_ok=True)

JB_ITEMS = [
    ("Галуа", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/galua/"),
    ("Потье", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/pote/"),
    ("Равашоль", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/ravashol/"),
    ("Лафайет", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/lafayet/"),
    ("Мирабо", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/mirabo/"),
    ("Верлен", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/verlen/"),
    ("Арагон", "https://jossbeaumont.ru/catalog/kollektsiya_veritas/aragon/"),
    ("Гойер", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/goyer/"),
    ("Кассини", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/kassini/"),
    ("Палей", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/paley/"),
    ("Романофф", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/romanoff/"),
    ("Рошефор", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/roshefor/"),
    ("Шелия", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/sheliya/"),
    ("Кипиани", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/kipiani/"),
    ("Журман", "https://jossbeaumont.ru/catalog/kollektsiya_gusto/zhurman/"),
    ("Леблан", "https://jossbeaumont.ru/catalog/kollektsiya_opus/leblan/"),
    ("Дюрас", "https://jossbeaumont.ru/catalog/kollektsiya_opus/dyuras/"),
    ("Жюль Верн", "https://jossbeaumont.ru/catalog/kollektsiya_opus/zhyul_vern/"),
    ("Колетт", "https://jossbeaumont.ru/catalog/kollektsiya_opus/kolett/"),
    ("Декарт", "https://www.silniypol.ru/catalog/laminat/joss_beaumont/opus/jossbeaumont-opus-dekart/"),
    ("Макарон", "https://jossbeaumont.ru/catalog/kollektsiya_liberte/makaron/"),
    ("Мильфей", "https://jossbeaumont.ru/catalog/kollektsiya_liberte/milfey/"),
    ("Профитроль", "https://jossbeaumont.ru/catalog/kollektsiya_liberte/profitrol/"),
    ("Шодо", "https://jossbeaumont.ru/catalog/kollektsiya_liberte/shodo/"),
]

def fetch(url):
    r = subprocess.run(['curl', '-sL', url, '-H', 'User-Agent: Mozilla/5.0'], capture_output=True, text=True, timeout=15)
    return r.stdout

def dl(url, path):
    subprocess.run(['curl', '-sL', '-o', path, url, '-H', 'User-Agent: Mozilla/5.0'], timeout=30)
    if os.path.exists(path):
        sz = os.path.getsize(path)
        r = subprocess.run(['file', '-b', path], capture_output=True, text=True)
        # Avoid the 159KB placeholder (size ~ 159185 bytes) and 404/HTML files
        if sz > 165000 and 'image' in r.stdout.lower():
            return sz
        elif sz > 10000 and sz < 155000 and 'image' in r.stdout.lower():
            return sz
        os.remove(path)
    return 0

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name_ru, url in JB_ITEMS:
            # First check if there are products with this name
            res = await conn.execute(text("SELECT id FROM product WHERE name ILIKE :name AND is_active=True"), {"name": f"%{name_ru}%"})
            rows = res.fetchall()
            if not rows:
                print(f"No active products for {name_ru}")
                continue
            
            slug = url.strip('/').split('/')[-1]
            filepath = os.path.join(DIR, f"{slug}.jpg")
            db_path = f"/static/uploads/jossbeaumont/{slug}.jpg"
            
            # Download if missing
            if not (os.path.exists(filepath) and os.path.getsize(filepath) > 10000 and os.path.getsize(filepath) != 159185):
                print(f"Fetching {name_ru} from {url}")
                html = fetch(url)
                if 'jossbeaumont.ru' in url:
                    imgs = re.findall(r'upload/iblock/[^"]+\.jpg', html)
                    # Try to find images > 160KB
                    found = False
                    for img in imgs:
                        img_url = f"https://jossbeaumont.ru/{img}"
                        sz = dl(img_url, filepath)
                        if sz > 0:
                            print(f"  ✓ Downloaded {sz} bytes")
                            found = True
                            break
                    if not found:
                        print(f"  ✗ Failed to download image for {name_ru}")
                        continue
                else:
                    # silniypol.ru
                    imgs = re.findall(r'src="(https?://[^"]+\.jpg)"', html)
                    found = False
                    for img_url in imgs[:5]:
                        sz = dl(img_url, filepath)
                        if sz > 0:
                            print(f"  ✓ Downloaded {sz} bytes from silniypol")
                            found = True
                            break
            
            # Update DB
            if os.path.exists(filepath):
                for r in rows:
                    await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": r[0]})
                    print(f"  ✓ DB updated for {name_ru} (ID: {r[0]})")

asyncio.run(main())
