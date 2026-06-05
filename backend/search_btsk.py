import httpx
from bs4 import BeautifulSoup
import urllib.parse

search_urls = [
    "https://stroitel-btsk.ru/search/?q=K064",
    "https://stroitel-btsk.ru/search/?q=2636",
    "https://stroitel-btsk.ru/?s=K064",
    "https://stroitel-btsk.ru/search/?query=K064"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    
    for url in search_urls:
        print(f"Trying search: {url}")
        try:
            r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
            print(f"  Status: {r.status_code}")
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                found = False
                for a in soup.find_all('a'):
                    href = a.get('href')
                    text = a.text.strip()
                    if href and ("K064" in href or "2636" in href or "element" in href.lower() or "artisan" in href.lower() or "artizan" in href.lower()):
                        print(f"    Link: {urllib.parse.urljoin(url, href)} | Text: {text}")
                        found = True
                if found:
                    break
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    main()
