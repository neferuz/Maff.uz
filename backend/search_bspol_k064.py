import httpx
from bs4 import BeautifulSoup
import urllib.parse

url = "https://bspol.ru/catalog/search?search_api_views_fulltext=K064"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
        print("Status:", r.status_code)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            for a in soup.find_all('a'):
                href = a.get('href')
                text = a.text.strip()
                if href and ("K064" in href or "k064" in href or "elemental" in href.lower()):
                    print(f"Link: {urllib.parse.urljoin(url, href)} | Text: {text}")
            for img in soup.find_all('img'):
                src = img.get('src')
                alt = img.get('alt') or ""
                if src and ("K064" in src or "k064" in src or "elemental" in src.lower()):
                    print(f"Img: {urllib.parse.urljoin(url, src)} | Alt: {alt}")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
