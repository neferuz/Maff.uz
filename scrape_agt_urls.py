import asyncio
import asyncpg
import urllib.request
import ssl
from bs4 import BeautifulSoup
import re
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            return r.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

async def main():
    print("1. Fetching AGT home page for collections...")
    home_html = fetch("https://agt.com.ru/")
    if not home_html: return
    
    soup = BeautifulSoup(home_html, "html.parser")
    collections = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if ("laminat" in href or "panel" in href or "plintus" in href) and "kolelkcziya" in href:
            if href.startswith("/"):
                href = "https://agt.com.ru" + href
            collections.add(href)
            
    print(f"Found {len(collections)} collections.")
    
    all_product_urls = set()
    for col_url in collections:
        print(f"Fetching {col_url} ...")
        html = fetch(col_url)
        if not html: continue
        col_soup = BeautifulSoup(html, "html.parser")
        
        for li in col_soup.find_all("li"):
            a = li.find("a", href=True)
            if a and a["href"].startswith("https://agt.com.ru/"):
                # usually product links contain prk or lb or dub
                if "prk" in a["href"].lower() or "lb" in a["href"].lower() or "laminat-agt" in a["href"]:
                    all_product_urls.add(a["href"])
                    
        time.sleep(0.5)
        
    print(f"Total product URLs collected: {len(all_product_urls)}")
    
    # Save to file
    with open("agt_product_urls.txt", "w") as f:
        for u in sorted(all_product_urls):
            f.write(u + "\n")

if __name__ == '__main__':
    asyncio.run(main())
