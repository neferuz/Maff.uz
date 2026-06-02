import urllib.request
import ssl
from bs4 import BeautifulSoup
import re

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
            
            # Print all image tags to see what else we have
            for img in soup.find_all("img"):
                if img.get("src") and ("Product" in img.get("src") or "Mekan" in img.get("src") or "mekan" in img.get("src").lower() or "room" in img.get("src").lower() or "interior" in img.get("src").lower()):
                    print(img.get("src"))
                    
            # Let's also check for background-image in inline styles
            for tag in soup.find_all(style=re.compile("background-image")):
                print("Style:", tag.get("style"))
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
