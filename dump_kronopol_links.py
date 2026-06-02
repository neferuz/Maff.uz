import urllib.request
import ssl
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

def main():
    url = "https://kronopol-russia.ru/"
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
                if "katalog" in href or "kollekcii" in href or "laminat" in href:
                    links.append(href)
                    
            print(f"Status: 200. Links:")
            for c in list(set(links)):
                print("  ", c)
                
    except Exception as e:
        print(f"Error fetching kronopol-russia.ru: {e}")

if __name__ == '__main__':
    main()
