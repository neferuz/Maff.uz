import re
import os
import shutil
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

html_file = os.path.join(base_dir, "Portika Порта.html")

# Read HTML
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. Parse image mapping from posObj
img_map = {}
pos_pattern = re.compile(r'posObj\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\);')
for match in pos_pattern.finditer(content):
    sheet, x, y, img_idx = match.groups()
    if int(x) == 1:
        img_map[y] = f"image_{sheet}_{img_idx}.jpg"
        
# 2. Extract row names from td elements
row_pattern = re.compile(r'<td class="[^"]*"\s+dir="ltr"[^>]*>([^<]+)</td>')
y_coord = 0
found_items = []

for match in row_pattern.finditer(content):
    cell_text = match.group(1).strip()
    if not cell_text:
        continue
        
    y_coord += 1
    
    if str(y_coord) in img_map:
        img_name = img_map[str(y_coord)]
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
            # safe_name is exactly what's in the Excel file
            search_name = safe_name.replace(" ", "%").replace("(", "%").replace(")", "%")
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '%{search_name}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Порта%');"
            result = await conn.execute(text(sql))
            print(f"DB Update for '{safe_name}': {result.rowcount} rows")

if found_items:
    asyncio.run(update_db())
else:
    print("Could not find mappings, investigating the file structure...")

