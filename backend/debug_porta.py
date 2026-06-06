import re
import os
from bs4 import BeautifulSoup

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Порта.html"
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')
tr = soup.find('tr', id='1009476925R9')
print(f"Found TR 1009476925R9: {tr is not None}")
if tr:
    for i, td in enumerate(tr.find_all('td')):
        print(f"TD {i}: text={td.text.strip()}, dir={td.get('dir')}")

