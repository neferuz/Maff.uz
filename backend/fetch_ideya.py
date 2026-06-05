import httpx
from bs4 import BeautifulSoup
import urllib.parse

url = "https://belgorod.ideya-parketa.ru/catalog/laminat/eurohome/majestic_/laminat_eurohome_majestic_k_064_dub_element/?oid=10061"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    
    with httpx.Client(headers=headers, follow_redirects=True, verify=False) as client:
        try:
            r = client.get(url, timeout=20.0)
            print("Status Code:", r.status_code)
            print("HTML Length:", len(r.text))
            
            soup = BeautifulSoup(r.text, 'html.parser')
            
            # Print page title
            print("Title:", soup.title.string if soup.title else "No Title")
            
            # Find og:image
            og_image = soup.find('meta', property='og:image')
            if og_image:
                print("OG Image:", urllib.parse.urljoin(url, og_image.get('content')))
                
            # Find all images
            images = []
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src')
                alt = img.get('alt') or ""
                if src:
                    images.append((urllib.parse.urljoin(url, src), alt))
            print(f"Found {len(images)} images in HTML:")
            for src, alt in images:
                if any(x in src.lower() or x in alt.lower() for x in ["k064", "element", "laminat", "upload", "iblock"]):
                    print(f"  Img: {src} | Alt: {alt}")
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    main()
