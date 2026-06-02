import urllib.request
import ssl
from bs4 import BeautifulSoup

def main():
    url = "https://www.agt.com.tr/urunler/agt-parke/koleksiyonlar/effect-elegance/solaro"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, "html.parser")
            
            # Find all images and background images
            import re
            links = re.findall(r'https://www.agt.com.tr/[a-zA-Z0-9_/-]+/Product/[a-zA-Z0-9_/-]+', html)
            print("Found product image links:")
            for link in set(links):
                print(link)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
