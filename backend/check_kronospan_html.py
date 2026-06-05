import httpx
from bs4 import BeautifulSoup
import urllib.parse
import ssl

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def check_url(name, url):
    print(f"\n=== checking {name}: {url} ===")
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, timeout=15.0, verify=False)
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            return
            
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Look for images containing the keyword or decor code
        img_urls = []
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                abs_src = urllib.parse.urljoin(url, src)
                img_urls.append((abs_src, img.get('alt') or ""))
                
        print(f"Found {len(img_urls)} image tags:")
        for src, alt in img_urls:
            # Print if it has keywords
            src_lower = src.lower()
            if any(x in src_lower for x in [name.lower(), "product", "decor", "iblock", "upload", "content", "tovar"]):
                print(f"  MATCH: {src} (alt: {alt})")
            else:
                # print a subset just in case
                if "logo" not in src_lower and "icon" not in src_lower:
                    print(f"  candidate: {src} (alt: {alt})")
                    
    except Exception as e:
        print(f"Error checking {name}: {e}")

def main():
    # Disable SSL warnings
    import urllib3
    urllib3.disable_warnings()
    
    # Check 8630
    check_url("8630", "https://www.poli24.ru/catalog/laminat/kronospan/floordreams_vario/laminat_kronospan_floordreams_vario_8630_dub_aspen/")
    
    # Check K039
    check_url("K039", "https://pan.by/otdelochnye-materialy/napolnye-pokrytiya/laminat-kronospan-castello-classic-silversayd-driftvud-k039/")
    
    # Check U602
    check_url("U602", "https://evro-laminat.ru/product/laminat-kronospan-forte-vario-dub-intenzo-tyomnyy-u602/")
    
    # Check K001
    check_url("K001", "https://evro-laminat.ru/product/laminat-kronospan-forte-vario-dub-belyy-kraft-k-001/")

if __name__ == "__main__":
    main()
