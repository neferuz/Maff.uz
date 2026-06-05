import httpx
from bs4 import BeautifulSoup
import urllib.parse

urls = {
    "2625": "https://evro-laminat.ru/product/laminat-eurohome-majestic-dzhari-loft-2625/",
    "2621": "https://evro-laminat.ru/product/laminat-eurohome-majestic-dub-viking-zolotoy-2621/",
    "7240": "https://evro-laminat.ru/product/laminat-eurohome-majestic-dub-kholda-7240/",
    "K405": "https://evro-laminat.ru/product/laminat-eurohome-art-k-405-dub-solnechnyy/"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    
    for code, url in urls.items():
        print(f"\n=== {code} ===")
        try:
            r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
            if r.status_code != 200:
                print(f"HTTP {r.status_code}")
                continue
            soup = BeautifulSoup(r.text, 'html.parser')
            
            # Find the main image
            # Let's list all images under class product-images or similar, or look at alt tags containing the code or name
            for img in soup.find_all('img'):
                src = img.get('src')
                alt = img.get('alt') or ""
                if src and ("/project/content/product/" in src or code in src or code in alt):
                    abs_src = urllib.parse.urljoin(url, src)
                    print(f"  Img: {abs_src} | Alt: {alt}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
