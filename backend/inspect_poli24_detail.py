import httpx
from bs4 import BeautifulSoup

url = "https://www.poli24.ru/catalog/laminat/kronospan/floordreams_vario/laminat_kronospan_floordreams_vario_8630_dub_aspen/"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

r = httpx.get(url, headers=headers, follow_redirects=True, verify=False)
soup = BeautifulSoup(r.text, 'html.parser')

print("=== ALL IMAGES IN BODY ===")
for img in soup.find_all('img'):
    src = img.get('src')
    alt = img.get('alt')
    class_ = img.get('class')
    print(f"src={src} | alt={alt} | class={class_}")

# Let's also look for links to images (.jpg, .png, .webp) in href attributes
print("\n=== IMAGES IN LINKS ===")
for a in soup.find_all('a'):
    href = a.get('href')
    if href and any(x in href.lower() for x in ['.jpg', '.jpeg', '.png', '.webp']):
        print(f"href={href} | text={a.text.strip()}")
