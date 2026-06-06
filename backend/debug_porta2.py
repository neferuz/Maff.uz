import re
from bs4 import BeautifulSoup

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Порта.html"
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')
trs = soup.find_all('tr')
for i in range(5):
    print(f"TR {i} ID:", trs[i].get('id'))

