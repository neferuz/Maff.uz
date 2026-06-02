import re
import json

def main():
    with open("egger_page.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    # Find all occurrences of self.__next_f.push
    pushes = re.findall(r'self\.__next_f\.push\(\[1,\"(.*)\"\]\)', html)
    print(f"Found {len(pushes)} Next.js server pushes.")
    
    full_rsc_text = ""
    for p in pushes:
        # Decode the escaped characters inside the string
        decoded = p.replace('\\"', '"').replace('\\\\', '\\').replace('\\/', '/')
        full_rsc_text += decoded
        
    print(f"RSC Decoded Text Length: {len(full_rsc_text)}")
    
    # Let's search for image URLs, titles, and price descriptions in the text
    # e.g., looking for .jpg or .png or avatars.mds.yandex.net or maps-adv-crm
    urls = re.findall(r'https?://[^\s\",]*\.(?:jpg|jpeg|png|webp)', full_rsc_text)
    print(f"\nFound {len(urls)} potential image URLs in RSC text:")
    for u in set(urls):
        print(f"  {u}")
        
    # Let's search for product names or text blocks
    # Yandex CRM image URLs usually look like: https://avatars.mds.yandex.net/get-maps-adv-crm/...
    yandex_images = re.findall(r'https?://avatars\.mds\.yandex\.net/[^\s\",\\]*', full_rsc_text)
    print(f"\nFound {len(yandex_images)} Yandex avatar URLs:")
    for y in set(yandex_images):
        print(f"  {y}")
        
    # Let's dump all text snippets that might be product details
    # We can write a regular expression to look for cyrillic product names or descriptions
    # Products in Yandex Business often have structure with name, price, description
    words = re.findall(r'[\u0400-\u04FF\w\s\-]{4,50}', full_rsc_text)
    print(f"\nSample text items (Cyrillic/words):")
    for w in set(words[:100]):
        w_strip = w.strip()
        if len(w_strip) > 10 and any(c.isalpha() for c in w_strip):
            print(f"  {repr(w_strip)}")

if __name__ == '__main__':
    main()
