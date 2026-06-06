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

# Read HTML
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
        img_row_map[row] = embed_to_img[embed_id]

# 3. Extract row names from td elements
row_pattern = re.compile(r'<td class="[^"]*"\s+dir="ltr"[^>]*>([^<]+)</td>')
y_coord = 0
found_items = []

for match in row_pattern.finditer(content):
    cell_text = match.group(1).strip()
    if not cell_text:
        continue
        
    y_coord += 1
    
    if str(y_coord) in img_row_map:
        img_name = img_row_map[str(y_coord)]
        src_path = os.path.join(base_dir, "resources", img_name)
        
        if os.path.exists(src_path):
            safe_name = cell_text.split("*")[0].strip()
            safe_name_file = safe_name.lower().replace(" ", "_").replace("/", "_").replace(".", "_").replace("(", "_").replace(")", "_")
            safe_name_file = "".join(c for c in safe_name_file if c.isalnum() or c == "_")
            
            new_filename = f"porta_{safe_name_file}.jpg"
            dst_path = os.path.join(out_dir, new_filename)
            shutil.copy2(src_path, dst_path)
            
            db_path = f"/static/uploads/doors/{new_filename}"
            found_items.append((safe_name, db_path))

print(f"Found {len(found_items)} image mappings in Portika Порта.html")

# Update DB
async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for safe_name, db_path in found_items:
            # We must be careful with ILIKE. 
            search_name = safe_name.replace(" ", "%").replace("(", "%").replace(")", "%")
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%{search_name}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Порта%');"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{safe_name}': {result.rowcount} rows")

if found_items:
    asyncio.run(update_db())
else:
    print("Could not find mappings, investigating the file structure...")

