import urllib.request
import ssl
from bs4 import BeautifulSoup
import re
import json

def main():
    url = "https://agt.com.ru/laminat-agt-kolelkcziya-natura-line"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, "html.parser")
            
            # Tilda stores products in div class="t-store__card"
            cards = soup.find_all("div", class_=re.compile("t-store__card"))
            if not cards:
                cards = soup.find_all("div", class_=re.compile("js-product"))
                
            print(f"Found {len(cards)} product cards.")
            
            for idx, card in enumerate(cards[:3]):
                print(f"--- Card {idx+1} ---")
                # title
                title_tag = card.find(class_=re.compile("js-store-prod-name")) or card.find("div", class_=re.compile("title"))
                title = title_tag.get_text(strip=True) if title_tag else "No title"
                
                # sku
                sku_tag = card.find(class_=re.compile("js-store-prod-sku"))
                sku = sku_tag.get_text(strip=True) if sku_tag else "No SKU"
                
                # img
                img_tag = card.find("img", class_=re.compile("js-product-img"))
                img = img_tag.get("src") if img_tag else "No image"
                if img_tag and img_tag.has_attr("data-original"):
                    img = img_tag["data-original"]
                    
                print(f"Title: {title}")
                print(f"SKU: {sku}")
                print(f"Img: {img}")
                
            # See if there's any JSON
            for script in soup.find_all("script"):
                if script.string and "tcart" in script.string:
                    print("Found tcart script")
                if script.string and "products" in script.string:
                    print("Found script with products array")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
