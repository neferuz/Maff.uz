import re
import os

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Порта.html"
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

matches = re.findall(r'<td[^>]*>([^<]*Порта-62[^<]*)</td>\s*<td[^>]*>([^<]*)</td>\s*<td[^>]*>([^<]*)</td>', content)
for m in matches:
    print(m)

