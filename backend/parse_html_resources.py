import re
import os
import json

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
html_files = [f for f in os.listdir(base_dir) if f.endswith('.html')]

# First, let's just find the posObj function in each file
mappings = []

for file in html_files:
    filepath = os.path.join(base_dir, file)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # find posObj('0', 'embed_123', row, col, x, y)
    pos_objs = re.findall(r"posObj\('0',\s*'([^']+)',\s*(\d+),\s*(\d+)", content)
    
    # find divs <div id='embed_123' ...><img src='resources/image_X.jpg'...>
    div_imgs = re.findall(r"<div id='([^']+)'[^>]*><img src='resources/([^']+)'", content)
    
    img_map = {embed_id: src for embed_id, src in div_imgs}
    
    # find text in table rows
    # a rough heuristic: search for row index
    rows = re.findall(r"<th id=\"0R(\d+)\"[^>]*>.*?</th>(.*?)</tr>", content)
    row_texts = {}
    for r_idx, r_html in rows:
        # strip tags
        text = re.sub(r'<[^>]+>', ' ', r_html)
        text = re.sub(r'\s+', ' ', text).strip()
        row_texts[r_idx] = text
        
    for embed_id, row, col in pos_objs:
        if embed_id in img_map:
            src = img_map[embed_id]
            # row in posObj is 0-indexed, but id="0R..." is 0-indexed too
            r_text = row_texts.get(row, "")
            
            # look a bit up if empty
            if not r_text and int(row) > 0:
                r_text = row_texts.get(str(int(row)-1), "")
                
            mappings.append({
                "file": file,
                "image": src,
                "row": row,
                "text": r_text[:100]
            })

for m in mappings:
    if 'Классико' in m['text'] or '33' in m['text'] or '83' in m['text'] or '13' in m['text'] or '43' in m['text']:
        print(f"File: {m['file']} | Image: {m['image']} | Text: {m['text']}")

