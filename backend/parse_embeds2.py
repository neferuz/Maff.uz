from bs4 import BeautifulSoup

html_file = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Portika Порта.html"

with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')
embeds = soup.find_all(id=lambda x: x and x.startswith('embed_'))

for e in embeds:
    print(f"ID: {e.get('id')}, Tag: {e.name}")
    # Print children to see if img is inside
    if e.name == 'div':
        img = e.find('img')
        if img:
            print(f"  Img src: {img.get('src')}")
        else:
            print("  No img child. InnerHTML:", str(e)[:100])

