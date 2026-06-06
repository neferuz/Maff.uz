import os
import glob
from bs4 import BeautifulSoup

def count_tarwood():
    html_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
    html_files = glob.glob(os.path.join(html_dir, "*.html"))
    count = 0
    items = []
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            rows = soup.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 3:
                    name = cols[1].get_text(strip=True)
                    if 'tarwood' in name.lower() or 'тарквуд' in name.lower() or 'tarkwood' in name.lower():
                        count += 1
                        items.append(name)
    print(f"Found {count} items:")
    for i in items:
        print(f" - {i}")

count_tarwood()
