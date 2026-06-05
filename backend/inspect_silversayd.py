import httpx
from bs4 import BeautifulSoup
import urllib.parse

url = "https://parket-step.ru/catalog/laminat_ultrafloor_vintage_classic_dub_silversayd_k451/"
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
            
            # Print main image or zoom image
            main_img = soup.find('img', class_='main-image') or soup.find('a', class_='zoom-image')
            if main_img:
                src = main_img.get('src') or main_img.get('href')
                print(f"Main image: {urllib.parse.urljoin(url, src)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
