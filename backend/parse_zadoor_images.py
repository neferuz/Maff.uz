import re
import os
import shutil

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"
os.makedirs(out_dir, exist_ok=True)

target_files = [
    "S-Classic.html",
    "Zadoor S.html",
    "Zadoor SP.html",
    "Classic Baguette Стандарт.html",
    "Квалитет Стандарт.html"
]

all_mappings = []

for file in target_files:
    filepath = os.path.join(base_dir, file)
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # regex updated to handle ANY sheet ID
    pos_objs = re.findall(r"posObj\('[^']+',\s*'([^']+)',\s*(\d+),\s*(\d+)", content)
    div_imgs = re.findall(r"<div id='([^']+)'[^>]*><img src='resources/([^']+)'", content)
    img_map = {embed_id: src for embed_id, src in div_imgs}
    
    # Handle both 0R and random string IDs for row indices
    rows = re.findall(r"<th id=\"[^\"]*R(\d+)\"[^>]*>.*?</th>(.*?)</tr>", content)
    row_texts = {}
    for r_idx, r_html in rows:
        text = re.sub(r'<[^>]+>', ' ', r_html)
        text = re.sub(r'\s+', ' ', text).strip()
        row_texts[r_idx] = text
        
    for embed_id, row, col in pos_objs:
        if embed_id in img_map:
            src = img_map[embed_id]
            r_text = row_texts.get(row, "")
            
            # If empty, look up a few rows (images can span cells or anchor weirdly)
            if not r_text:
                for offset in range(1, 4):
                    r_text = row_texts.get(str(int(row)-offset), "")
                    if r_text: break
            
            # Clean text to just the product name part (before numbers like 2000*800 or prices)
            clean_name = re.sub(r'2000\*\d+.*', '', r_text).strip()
            if not clean_name: continue
            
            # Create a safe slug for the filename
            safe_name = re.sub(r'[^a-zA-Z0-9а-яА-ЯёЁ_ \-]', '', clean_name)
            safe_name = safe_name.replace(" ", "_").lower()
            if len(safe_name) > 50: safe_name = safe_name[:50]
            
            new_filename = f"zadoor_{safe_name}.jpg"
            
            src_path = os.path.join(base_dir, "resources", src)
            dst_path = os.path.join(out_dir, new_filename)
            
            if os.path.exists(src_path):
                shutil.copy2(src_path, dst_path)
                
                all_mappings.append({
                    "file": file,
                    "original_image": src,
                    "new_image": new_filename,
                    "db_path": f"/static/uploads/doors/{new_filename}",
                    "row_text": clean_name
                })

# Print out a summary of extracted mappings
print(f"Extracted {len(all_mappings)} images!")
for m in all_mappings[:20]:
    print(f"File: {m['file']} -> {m['row_text']} -> {m['new_image']}")

# Generate SQL
sql_statements = []
for m in all_mappings:
    search_term = m['row_text'][:15].replace("'", "''") 
    sql = f"UPDATE product SET image_url = '{m['db_path']}', is_active = true WHERE name ILIKE '%{search_term}%' AND category_id != 426 AND category_id != 429;"
    sql_statements.append(sql)

with open("update_zadoor.sql", "w") as f:
    f.write("\n".join(sql_statements))
print("Wrote SQL to update_zadoor.sql")

