import httpx
from bs4 import BeautifulSoup
import urllib.parse

urls = {
    "K064": "https://belgorod.ideya-parketa.ru/catalog/laminat/eurohome/majestic_/laminat_eurohome_majestic_k_064_dub_element/?oid=10061",
    "2636": "https://www.santehnica.ru/product/946180.html",
    "K277": "https://www.dom-laminata.ru/tovar.php?id_tovar=2130",
    "K451": "https://parket-step.ru/catalog/laminat_ultrafloor_vintage_classic_dub_silverside_k451/"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    
    for code, url in urls.items():
        print(f"\n=== {code}: {url} ===")
        try:
            r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
            print(f"Status: {r.status_code}")
            if r.status_code != 200:
                continue
            soup = BeautifulSoup(r.text, 'html.parser')
            
            # Print og:image
            og_image = soup.find('meta', property='og:image')
            if og_image:
                print(f"  OG Image: {urllib.parse.urljoin(url, og_image.get('content'))}")
            
            # Print image tags containing code
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                alt = img.get('alt') or ""
                if src:
                    src_lower = src.lower()
                    if any(x in src_lower or x in alt.lower() for x in [code.lower(), "product", "tovar", "iblock", "upload"]):
                        abs_src = urllib.parse.urljoin(url, src)
                        print(f"  Img match: {abs_src} | Alt: {alt}")
                        
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
