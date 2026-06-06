from bs4 import BeautifulSoup

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Порта.html"
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')
trs = soup.find_all('tr')
for row_idx in [9, 10, 43, 76, 77]:
    if row_idx < len(trs):
        text = trs[row_idx].text.replace('\n', ' ').strip()
        print(f"TR {row_idx}: {text[:100]}")
    else:
        print(f"TR {row_idx} is out of bounds")

