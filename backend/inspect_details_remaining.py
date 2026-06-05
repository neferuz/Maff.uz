import httpx
from bs4 import BeautifulSoup
import urllib.parse

urls = {
    "K064": "https://belgorod.ideya-parketa.ru/catalog/laminat/eurohome/majestic_/laminat_eurohome_majestic_k_064_dub_element/?oid=10061",
    "K277": "https://www.dom-laminata.ru/tovar.php?id_tovar=2130"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    
    for code, url in urls.items():
        print(f"\n=== {code} ===")
        r = httpx.get(url, headers=headers, follow_redirects=True, verify=False)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        print("Page Title:", soup.title.string if soup.title else "No Title")
        
        print("All Images:")
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            alt = img.get('alt')
            if src:
                abs_src = urllib.parse.urljoin(url, src)
                print(f"  src: {abs_src} | alt: {alt}")
                
        print("All Links with Images:")
        for a in soup.find_all('a'):
            href = a.get('href')
            if href and any(x in href.lower() for x in ['.jpg', '.jpeg', '.png']):
                abs_href = urllib.parse.urljoin(url, href)
                print(f"  link: {abs_href}")

if __name__ == "__main__":
    main()
