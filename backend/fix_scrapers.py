import requests
from bs4 import BeautifulSoup

urls = [
    "https://elporta.by/catalog/mezhkomnatnye-dveri/eko-shpon/neoclassico/neoklassiko-2-pro-ice",
    "https://portika.ru/mezhkomnatnyie-dveri/eksimer-%28eximer%29/seriya-neoclassico/neo-11?modification=1078"
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

for url in urls:
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    
    # Try finding any big image
    imgs = soup.find_all('img')
    print(f"\n--- URL: {url} ---")
    for img in imgs:
        src = img.get('src') or img.get('data-src') or ''
        if 'product' in src or 'upload' in src or 'catalog' in src:
            print(f"Candidate: {src} | class={img.get('class')}")
