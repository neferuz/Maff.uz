import re
content = open("/Users/apple/Desktop/Maff.uz-main/Двери Дил/S-Classic.html", "r").read()

pos_objs = re.findall(r"posObj\('[^']+',\s*'([^']+)',\s*(\d+),\s*(\d+)", content)
div_imgs = re.findall(r"<div id='([^']+)'[^>]*><img src='resources/([^']+)'", content)
img_map = {embed_id: src for embed_id, src in div_imgs}

rows = re.findall(r"<th id=\"[^\"]*R(\d+)\"[^>]*>.*?</th>(.*?)</tr>", content)
row_texts = {}
for r_idx, r_html in rows:
    text = re.sub(r'<[^>]+>', ' ', r_html)
    text = re.sub(r'\s+', ' ', text).strip()
    row_texts[int(r_idx)] = text

for embed_id, row, col in pos_objs[:5]:
    row = int(row)
    src = img_map.get(embed_id, "")
    print(f"\n--- Image: {src} at Row: {row}, Col: {col} ---")
    for i in range(max(0, row-2), row+3):
        if i in row_texts and row_texts[i]:
            marker = ">>" if i == row else "  "
            print(f"{marker} Row {i}: {row_texts[i][:60]}")

