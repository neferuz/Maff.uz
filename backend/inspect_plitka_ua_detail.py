import httpx
from bs4 import BeautifulSoup

url = "https://plitka.ua/ru/product/laminat-krono-original-kronostep-k064-dub-elemental-oak-1329222/"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
}

def main():
    import urllib3
    urllib3.disable_warnings()
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
        print("Status:", r.status_code)
        print("Final URL:", r.url)
        print("Response length:", len(r.text))
        soup = BeautifulSoup(r.text, 'html.parser')
        print("Title:", soup.title.string if soup.title else "No Title")
        # Print first 200 characters of body text
        if soup.body:
            print("Body Snippet:", soup.body.text.strip()[:300].replace('\n', ' '))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
