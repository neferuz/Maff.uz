import re
import json

def main():
    filepath = "/Users/apple/.gemini/antigravity-ide/brain/d2dde1db-e0b5-4a54-9c42-163c078c9c24/.system_generated/steps/3486/content.md"
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
        
    # Find all occurrences of self.__next_f.push
    pushes = re.findall(r'self\.__next_f\.push\(\[1,\"(.*)\"\]\)', html)
    print(f"Found {len(pushes)} Next.js server pushes in Obninsk page.")
    
    full_rsc_text = ""
    for p in pushes:
        # Decode the escaped characters inside the string
        decoded = p.replace('\\"', '"').replace('\\\\', '\\').replace('\\/', '/')
        full_rsc_text += decoded
        
    print(f"RSC Decoded Text Length: {len(full_rsc_text)}")
    
    # Write the decoded RSC text to a file for manual inspection or simple grep
    with open("obninsk_decoded_rsc.txt", "w", encoding="utf-8") as f:
        f.write(full_rsc_text)
        
    # Let's search for image URLs, decors like EL2152, or Cyrillic words
    yandex_images = re.findall(r'https?://avatars\.mds\.yandex\.net/[^\s\",\\]*', full_rsc_text)
    print(f"\nFound {len(yandex_images)} Yandex avatar URLs:")
    for y in set(yandex_images):
        print(f"  {y}")
        
    # Search for Egger decors (like EL followed by 4 digits or 3 digits)
    decors = re.findall(r'EL\d{3,4}', full_rsc_text)
    print(f"\nFound decors matching 'ELxxxx': {len(decors)}")
    for d in set(decors):
        print(f"  {d}")
        
    # Let's search for product names or text blocks
    # We look for Cyrillic words representing product titles
    russian_words = re.findall(r'[\u0400-\u04FF][\u0400-\u04FF\s\-0-9a-zA-Z\.\(\)\,\"\!]{10,100}', full_rsc_text)
    print(f"\nCyrillic snippets found: {len(russian_words)}")
    for rw in set(russian_words[:40]):
        print(f"  - {rw.strip()}")

if __name__ == '__main__':
    main()
