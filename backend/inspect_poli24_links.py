import httpx
from bs4 import BeautifulSoup

url = "https://www.poli24.ru/catalog/laminat/kronospan/floordreams_vario/laminat_kronospan_floordreams_vario_8630_dub_aspen/"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

r = httpx.get(url, headers=headers, follow_redirects=True, verify=False)
soup = BeautifulSoup(r.text, 'html.parser')

# Find all a tags with iblock images
for a in soup.find_all('a'):
    href = a.get('href')
    if href and '/upload/iblock/' in href:
        # Print the a tag and its parent/children
        print(f"Parent: {a.parent.name} | class={a.parent.get('class')}")
        print(f"Tag: {a}")
        img = a.find('img')
        if img:
            print(f"  Nested Img: {img}")
        print("-" * 50)
