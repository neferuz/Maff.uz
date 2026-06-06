import re
import os

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Порта.html"

with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find all <img> tags or <div> with embed
img_matches = re.finditer(r'<div id="(embed_\d+)"[^>]*><img src="([^"]+)"', content)
embed_to_img = {}
for m in img_matches:
    embed_id = m.group(1)
    img_src = m.group(2)
    embed_to_img[embed_id] = os.path.basename(img_src)
    print(f"{embed_id} -> {img_src}")

# Now match posObj
pos_pattern = re.compile(r"posObj\('\d+',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)")
for m in pos_pattern.finditer(content):
    embed_id, row, col, x, y = m.groups()
    img_src = embed_to_img.get(embed_id, "UNKNOWN")
    print(f"Row {row} has {img_src}")

