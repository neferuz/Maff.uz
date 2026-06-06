import re
import os
import shutil
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()
db_url = os.getenv('DATABASE_URL')

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

html_file = os.path.join(base_dir, "Portika Порта.html")

with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

# 1. Map embed IDs to image filenames
embed_to_img = {}
embeds = soup.find_all(id=lambda x: x and x.startswith('embed_'))
for e in embeds:
    img = e.find('img')
    if img:
        src = img.get('src')
        if src:
            filename = os.path.basename(src)
            embed_to_img[e.get('id')] = filename

# 2. Extract posObj mappings from JavaScript
img_row_map = {}
pos_pattern = re.compile(r"posObj\('[^']+',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)")
for m in pos_pattern.finditer(content):
    embed_id, row, col, x, y = m.groups()
    if embed_id in embed_to_img:
        img_row_map[int(row)] = embed_to_img[embed_id]

# 3. Extract names from TR elements
found_items = []
trs = soup.find_all('tr')

for row_idx, img_name in img_row_map.items():
    if row_idx < len(trs):
        tr = trs[row_idx]
        # Find the first TD with dir="ltr" that has actual text
        tds = tr.find_all('td', dir="ltr")
        cell_text = ""
        for td in tds:
            if td.text.strip() and not td.text.strip().startswith('$') and len(td.text.strip()) > 3:
                # Exclude strings that look like pure numbers or prices
                if not re.match(r'^\d+$', td.text.strip()):
                    cell_text = td.text.strip()
                    break
                    
        if cell_text:
            src_path = os.path.join(base_dir, "resources", img_name)
            if os.path.exists(src_path):
                # Clean name: "Порта-50 4AB Эксимер Keramik Brown 2000*600 (Черный: М)" -> "Порта-50 4AB Эксимер Keramik Brown"
                safe_name = cell_text.split("*")[0]
                
                # Further cleanup, remove dimensions like "2000" if they are at the end
                safe_name = re.sub(r'\s+\d{4}$', '', safe_name).strip()
                
                safe_name_file = safe_name.lower().replace(" ", "_").replace("/", "_").replace(".", "_").replace("(", "_").replace(")", "_")
                safe_name_file = "".join(c for c in safe_name_file if c.isalnum() or c == "_")
                
                new_filename = f"porta_{safe_name_file}.jpg"
                dst_path = os.path.join(out_dir, new_filename)
                shutil.copy2(src_path, dst_path)
                
                db_path = f"/static/uploads/doors/{new_filename}"
                found_items.append((safe_name, db_path))

print(f"Found {len(found_items)} actual mappings!")
for n, p in found_items:
    print(f"  {n} -> {p}")

# Update DB
async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for safe_name, db_path in found_items:
            # Match start of string to avoid matching unrelated things, replacing spaces with %
            search_name = safe_name.replace(" ", "%").replace("(", "%").replace(")", "%")
            
            # Since names are like "Порта-50 4AB Эксимер Keramik Brown", we will use ILIKE
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%{search_name}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Порта%');"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{safe_name}': {result.rowcount} rows")

if found_items:
    asyncio.run(update_db())

