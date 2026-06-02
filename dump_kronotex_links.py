import urllib.request
import ssl
from bs4 import BeautifulSoup
import re

def main():
    url = "https://www.kronotex.ru/"
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, "html.parser")
            
            links = []
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "http" not in href or "kronotex.ru" in href:
                    links.append(href)
                    
            print(f"Status: 200. Links:")
            for c in list(set(links)):
                print("  ", c)
                
    except Exception as e:
        print(f"Error fetching kronotex.ru: {e}")

if __name__ == '__main__':
    main()
