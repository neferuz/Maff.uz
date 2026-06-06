import re
import os

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
file = "Portika Классико.html"
filepath = os.path.join(base_dir, file)

with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

pos_objs = re.findall(r"posObj\('0',\s*'([^']+)',\s*(\d+),\s*(\d+)", content)
div_imgs = re.findall(r"<div id='([^']+)'[^>]*><img src='resources/([^']+)'", content)
img_map = {embed_id: src for embed_id, src in div_imgs}

rows = re.findall(r"<th id=\"0R(\d+)\"[^>]*>.*?</th>(.*?)</tr>", content)
row_texts = {}
for r_idx, r_html in rows:
    text = re.sub(r'<[^>]+>', ' ', r_html)
    text = re.sub(r'\s+', ' ', text).strip()
    row_texts[r_idx] = text
    
for embed_id, row, col in pos_objs:
    if embed_id in img_map:
        src = img_map[embed_id]
        r_text = row_texts.get(row, "")
        if not r_text and int(row) > 0:
            r_text = row_texts.get(str(int(row)-1), "")
            
        print(f"Image: {src} | Row: {row} | Text: {r_text[:100]}")

