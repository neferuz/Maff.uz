from bs4 import BeautifulSoup
import re
import os

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Классико.html"
with open(html_file, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

print("Parsing HTML...")
rows = soup.find_all('tr')
print(f"Found {len(rows)} rows")

matches = {}

for row in rows:
    # A typical row has columns for name and image
    # Let's just find the text and any images in the row
    text_cols = row.find_all('td')
    if not text_cols:
        continue
        
    text = " ".join([c.get_text(strip=True) for c in text_cols])
    images = row.find_all('img')
    
    if images and ('Классико' in text or 'Grey Oak' in text or 'Light Sonoma' in text):
        img_src = images[0].get('src')
        if img_src:
            img_name = os.path.basename(img_src)
            # Find the actual product name
            # Usually the product name is in one of the cells
            for c in text_cols:
                c_text = c.get_text(strip=True)
                if 'Классико' in c_text or 'Grey Oak' in c_text or 'Sonoma' in c_text:
                    if c_text not in matches:
                        matches[c_text] = img_name
                        print(f"Found: '{c_text}' -> {img_name}")

print(f"\nTotal mappings found: {len(matches)}")
