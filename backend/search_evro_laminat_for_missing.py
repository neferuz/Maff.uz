import httpx
from bs4 import BeautifulSoup
import urllib.parse

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

missing = {
    "K451": "https://evro-laminat.ru/search/?search=K451",
    "2636": "https://evro-laminat.ru/search/?search=2636",
    "K064": "https://evro-laminat.ru/search/?search=K064",
    "8630": "https://evro-laminat.ru/search/?search=8630"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    
    for code, url in missing.items():
        print(f"\n=== Searching {code} ===")
        try:
            r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
            print(f"Status: {r.status_code}")
            if r.status_code != 200:
                continue
            soup = BeautifulSoup(r.text, 'html.parser')
            
            # Find all product links or images
            for img in soup.find_all('img'):
                src = img.get('src')
                alt = img.get('alt') or ""
                if src and ("/project/content/product/" in src or code in src or code in alt):
                    abs_src = urllib.parse.urljoin(url, src)
                    print(f"  Img: {abs_src} | Alt: {alt}")
                    
            for a in soup.find_all('a'):
                href = a.get('href')
                text = a.text.strip()
                if href and (code in href or code in text):
                    print(f"  Link: {urllib.parse.urljoin(url, href)} | Text: {text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
