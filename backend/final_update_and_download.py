import subprocess
import re
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads'

def dl(url, path):
    subprocess.run(['curl', '-sL', '-o', path, url, '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '--max-time', '15'], timeout=20)
    if os.path.exists(path):
        r = subprocess.run(['file', '-b', path], capture_output=True, text=True)
        sz = os.path.getsize(path)
        if sz > 5000 and 'image' in r.stdout.lower():
            return sz
    if os.path.exists(path):
        os.remove(path)
    return 0

def fetch(url):
    r = subprocess.run(['curl', '-sL', url, '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '--max-time', '15'], capture_output=True, text=True, timeout=20)
    return r.stdout

# ============== DOWNLOAD MISSING EGGER ==============
egger_dir = f"{DIR}/egger"

# Direct image link from user for EHL158
dl("https://www.egger-russia.ru/upload/iblock/16f/kz5wk8zhmbw06avba468s7a0h8fa66vb.jpg", f"{egger_dir}/ehl158_direct.jpg")

# Try to get remaining Egger from ozon/other
EGGER_OZON = {
    'ehl201': 'https://12.kz/products/0574929',
}

for code, url in EGGER_OZON.items():
    fp = f"{egger_dir}/{code}.jpg"
    if os.path.exists(fp) and os.path.getsize(fp) > 10000:
        continue
    html = fetch(url)
    imgs = re.findall(r'src="(https?://[^"]+\.(?:jpg|jpeg|png))"', html)
    imgs = [i for i in imgs if 'product' in i.lower() or 'media' in i.lower() or 'upload' in i.lower()]
    for img_url in imgs[:5]:
        sz = dl(img_url, fp)
        if sz > 0:
            print(f"✓ {code} from {url}")
            break

# ============== DOWNLOAD JOSS BEAUMONT ==============
jb_dir = f"{DIR}/jossbeaumont"
os.makedirs(jb_dir, exist_ok=True)

JB_PAGES = {
    'galua': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/galua/',
    'potie': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/pote/',
    'ravashol': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/ravashol/',
    'lafayet': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/lafayet/',
    'mirabo': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/mirabo/',
    'verlen': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/verlen/',
    'aragon': 'https://jossbeaumont.ru/catalog/kollektsiya_veritas/aragon/',
    'goyer': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/goyer/',
    'kassini': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/kassini/',
    'paley': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/paley/',
    'romanoff': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/romanoff/',
    'roshefor': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/roshefor/',
    'sheliya': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/sheliya/',
    'kipiani': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/kipiani/',
    'zhurman': 'https://jossbeaumont.ru/catalog/kollektsiya_gusto/zhurman/',
    'leblan': 'https://jossbeaumont.ru/catalog/kollektsiya_opus/leblan/',
    'dyuras': 'https://jossbeaumont.ru/catalog/kollektsiya_opus/dyuras/',
    'zhyul_vern': 'https://jossbeaumont.ru/catalog/kollektsiya_opus/zhyul_vern/',
    'kolett': 'https://jossbeaumont.ru/catalog/kollektsiya_opus/kolett/',
    'makaron': 'https://jossbeaumont.ru/catalog/kollektsiya_liberte/makaron/',
    'milfey': 'https://jossbeaumont.ru/catalog/kollektsiya_liberte/milfey/',
    'profitrol': 'https://jossbeaumont.ru/catalog/kollektsiya_liberte/profitrol/',
    'shodo': 'https://jossbeaumont.ru/catalog/kollektsiya_liberte/shodo/',
}

for name, url in JB_PAGES.items():
    fp = f"{jb_dir}/jb_{name}.jpg"
    if os.path.exists(fp) and os.path.getsize(fp) > 5000:
        print(f"✓ Already have jb_{name}")
        continue
    
    html = fetch(url)
    # Find product images
    imgs = re.findall(r'src="(/upload/[^"]+\.(?:jpg|jpeg|png|webp))"', html)
    if not imgs:
        imgs = re.findall(r'src="([^"]+\.(?:jpg|jpeg|png))"', html)
        imgs = [i for i in imgs if 'upload' in i.lower() or 'catalog' in i.lower() or 'product' in i.lower()]
    
    found = False
    for img_path in imgs[:5]:
        if img_path.startswith('/'):
            img_url = f"https://jossbeaumont.ru{img_path}"
        else:
            img_url = img_path
        sz = dl(img_url, fp)
        if sz > 0:
            print(f"✓ jb_{name} OK ({sz} bytes)")
            found = True
            break
    if not found:
        print(f"✗ jb_{name} FAILED ({len(imgs)} imgs found)")

# ============== UPDATE DATABASE ==============
async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        updated = 0
        
        # Update remaining Egger
        egger_files = [f for f in os.listdir(egger_dir) if f.endswith('.jpg') and os.path.getsize(os.path.join(egger_dir, f)) > 5000]
        for f in egger_files:
            r = subprocess.run(['file', '-b', os.path.join(egger_dir, f)], capture_output=True, text=True)
            if 'image' not in r.stdout.lower():
                continue
            match = re.search(r'ehl(\d+)', f)
            if match:
                code = f"EHL{match.group(1)}"
                db_path = f"/static/uploads/egger/{f}"
                res = await conn.execute(text("SELECT id FROM product WHERE name LIKE :pattern AND is_active = True AND (image_url IS NULL OR image_url = '' OR image_url = '/products/laminate-1.png')"), {"pattern": f"%{code}%"})
                rows = res.fetchall()
                for row in rows:
                    await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": row[0]})
                    print(f"  DB: ID={row[0]} -> {db_path}")
                    updated += 1
        
        print(f"\nTotal DB updates: {updated}")

asyncio.run(update_db())
print("\nDONE!")
