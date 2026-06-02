import urllib.request
import ssl
from bs4 import BeautifulSoup
import re

def main():
    url = "https://www.kronotex.ru/Kollektsii/MAMMUT/Everest-Oak-Bronze-D-3077-0001041025.html"
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
            
            images = []
            for img in soup.find_all("img"):
                src = img.get("src")
                if src and (".jpg" in src.lower() or ".png" in src.lower()):
                    images.append(src)
                    
            print(f"Found {len(set(images))} images:")
            for img in list(set(images)):
                print("  ", img)
                
    except Exception as e:
        print(f"Error fetching: {e}")

if __name__ == '__main__':
    main()
