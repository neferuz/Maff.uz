import httpx
from bs4 import BeautifulSoup
import urllib.parse

url = "https://felicita-crimea.ru/search/?q=K064"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    r = httpx.get(url, headers=headers, verify=False)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    print("Links in search results:")
    for a in soup.find_all('a'):
        href = a.get('href')
        text = a.text.strip()
        if href and ("laminat" in href.lower() or "k064" in href.lower() or "element" in href.lower() or "majestic" in href.lower()):
            print(f"  Link: {urllib.parse.urljoin(url, href)} | Text: {text}")

if __name__ == "__main__":
    main()
