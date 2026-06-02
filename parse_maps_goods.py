import bs4
import json
import re

def main():
    filepath = "/Users/apple/.gemini/antigravity-ide/brain/d2dde1db-e0b5-4a54-9c42-163c078c9c24/.system_generated/steps/3496/content.md"
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
        
    # Search for JSON data that is typically embedded in Yandex Maps pages
    # e.g., inside <script class="config-view" type="application/json"> or similar
    soup = bs4.BeautifulSoup(html, 'html.parser')
    scripts = soup.find_all('script')
    
    print(f"Total script tags: {len(scripts)}")
    
    # Search for all strings matching avatars.mds.yandex.net
    yandex_images = re.findall(r'https?://avatars\.mds\.yandex\.net/get-altay/[^\s\",\\]*', html)
    print(f"\nFound {len(yandex_images)} Yandex Altay image URLs:")
    for y in set(yandex_images[:10]):
        print(f"  {y}")
        
    # Yandex also stores image URLs in /get-tycoon/ or /get-maps-adv-crm/
    maps_images = re.findall(r'https?://avatars\.mds\.yandex\.net/get-[a-zA-Z0-9_-]+/[^\s\",\\]*', html)
    print(f"\nFound {len(maps_images)} Yandex avatar image URLs:")
    for y in set(maps_images[:20]):
        print(f"  {y}")

    # Let's search inside scripts for product names or "Egger" or "EL2152"
    found_eggers = []
    for idx, s in enumerate(scripts):
        code = s.string or ""
        if "EL" in code or "egger" in code.lower() or "дуб" in code.lower():
            found_eggers.append((idx, len(code)))
            
    print(f"\nScripts with Egger/decor keywords: {found_eggers}")
    
    # Let's find any text matching our SKUs (EL followed by 4 digits or 3 digits)
    decors = re.findall(r'EL\d{3,4}', html)
    print(f"\nFound decors matching 'ELxxxx': {len(decors)}")
    for d in set(decors):
        print(f"  {d}")

    # Let's dump all text elements containing product-like keywords
    texts = soup.find_all(string=True)
    matches = [t.strip() for t in texts if t.strip() and any(k in t.lower() for k in ["ламинат", "плинт", "eversense", "egger", "декор", "дуб"])]
    print(f"\nMatching visible text items: {len(matches)}")
    for m in matches[:30]:
        print(f" - {m}")

if __name__ == '__main__':
    main()
