import httpx
from bs4 import BeautifulSoup
import urllib.parse

url = "https://sherwood-nn.ru/laminat/eurohome/art-12-33/2636/"
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
            
            # Print all image tags
            for img in soup.find_all('img'):
                src = img.get('src')
                alt = img.get('alt') or ""
                if src:
                    print(f"  Img: {urllib.parse.urljoin(url, src)} | Alt: {alt}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
