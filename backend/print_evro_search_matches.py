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
        print(f"\nSearch results for {code}:")
        try:
            r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
            if r.status_code != 200:
                print(f"  HTTP {r.status_code}")
                continue
            soup = BeautifulSoup(r.text, 'html.parser')
            
            found = False
            for img in soup.find_all('img'):
                src = img.get('src')
                alt = img.get('alt') or ""
                if src and ("/project/content/product/" in src or code in src or code in alt):
                    abs_src = urllib.parse.urljoin(url, src)
                    # We only care about images that actually match the product code or name
                    if code in alt or code in src:
                        print(f"  Img: {abs_src} | Alt: {alt}")
                        found = True
            if not found:
                # print any products in the search list
                print("  No direct code matches in images. Checking titles...")
                for a in soup.find_all('a'):
                    href = a.get('href')
                    text = a.text.strip()
                    if href and (code in href or code in text or "majestic" in text.lower() or "art" in text.lower()):
                        # Find the image inside this link or adjacent
                        print(f"  Link: {urllib.parse.urljoin(url, href)} | Text: {text}")
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    main()
