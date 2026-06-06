import re
import os
from bs4 import BeautifulSoup

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Цены 1C.html"
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')
for td in soup.find_all('td'):
    text = td.get_text()
    if 'Порта-62' in text or 'Порта-50.1 4AB ПП Grey Oak' in text:
        # Find next cells
        nxt = td.find_next_siblings('td')
        prices = [n.get_text().strip() for n in nxt[:3]]
        print(f"Found: {text.strip()} | Prices: {prices}")

