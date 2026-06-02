import urllib.request
import ssl
from bs4 import BeautifulSoup
import urllib.parse

def main():
    q = urllib.parse.quote("PROtector Thermo")
    url = f"https://www.solidgroup.ru/search/?q={q}"
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
            
            print(f"Status: 200. Length: {len(html)}")
            for a in soup.find_all("a", href=True):
                if "catalog" in a["href"]:
                    print("Found link:", a["href"])
                
    except Exception as e:
        print(f"Error fetching: {e}")

if __name__ == '__main__':
    main()
