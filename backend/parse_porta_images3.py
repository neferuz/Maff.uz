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
pos_pattern = re.compile(r"posObj\('([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)")
for m in pos_pattern.finditer(content):
    sheet, embed_id, row, col, x, y = m.groups()
    if embed_id in embed_to_img:
        img_row_map[row] = (sheet, embed_to_img[embed_id])

# 3. Extract names from TR elements
found_items = []
for row_str, (sheet, img_name) in img_row_map.items():
    tr_id = f"{sheet}R{row_str}"
    tr = soup.find('tr', id=tr_id)
    
    if tr:
        # Find the first TD with dir="ltr" that has text
        tds = tr.find_all('td', dir="ltr")
        cell_text = ""
        for td in tds:
            if td.text.strip() and len(td.text.strip()) > 3: # Must have some name, not just a price like $63
                cell_text = td.text.strip()
                break
                
        if cell_text:
            src_path = os.path.join(base_dir, "resources", img_name)
            if os.path.exists(src_path):
                safe_name = cell_text.split("*")[0].split("  ")[0].strip() # Clean name up to size or double spaces
                
                # Cleanup cyrillic C to english C in safe name
                safe_name = safe_name.replace("Сrystal", "Crystal")
                
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
            # We must be careful with ILIKE. 
            search_name = safe_name.replace(" ", "%").replace("(", "%").replace(")", "%")
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%{search_name}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Порта%');"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{safe_name}': {result.rowcount} rows")

if found_items:
    asyncio.run(update_db())

