import httpx
from bs4 import BeautifulSoup
import urllib.parse

url = "https://felicita-crimea.ru/products/laminat-eurohome-majestic-8-33-k064-dub-elementalnyy"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            # Look for og:image
            og_image = soup.find('meta', property='og:image')
            if og_image:
                print(f"OG Image: {urllib.parse.urljoin(url, og_image.get('content'))}")
            
            # Print images in main product area
            for img in soup.find_all('img'):
                src = img.get('src')
                alt = img.get('alt') or ""
                if src and any(x in src.lower() or x in alt.lower() for x in ["k064", "elemental", "product", "image"]):
                    print(f"  Img: {urllib.parse.urljoin(url, src)} | Alt: {alt}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
