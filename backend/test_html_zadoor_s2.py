import re
content = open("/Users/apple/Desktop/Maff.uz-main/Двери Дил/Zadoor S.html", "r").read()

rows = re.findall(r"<th id=\"[^\"]*R(\d+)\"[^>]*>.*?</th>(.*?)</tr>", content)
row_texts = {}
for r_idx, r_html in rows:
    text = re.sub(r'<[^>]+>', ' ', r_html)
    text = re.sub(r'\s+', ' ', text).strip()
    row_texts[int(r_idx)] = text

for i in range(40, 55):
    print(f"Row {i}: {row_texts.get(i, '')[:60]}")
