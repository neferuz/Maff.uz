import subprocess
import re
import os

DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/egger'

def fetch(url):
    r = subprocess.run(['curl', '-sL', url, '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '--max-time', '15'], capture_output=True, text=True, timeout=20)
    return r.stdout

def dl(url, path):
    subprocess.run(['curl', '-sL', '-o', path, url, '-H', 'User-Agent: Mozilla/5.0', '--max-time', '15'], timeout=20)
    if os.path.exists(path):
        r = subprocess.run(['file', '-b', path], capture_output=True, text=True)
        sz = os.path.getsize(path)
        if sz > 5000 and 'image' in r.stdout.lower():
            return sz
    if os.path.exists(path):
        os.remove(path)
    return 0

# For each missing code, fetch the egger-russia product page and get the product image
# The product image is typically the 3rd or 4th src in /upload/iblock/
MISSING = {
    'ehl032': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl032-alvados-oak/',
    'ehl039': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl039-parkett-oak/',
    'ehl146': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl146-natural-elva-oak/',
    'ehl185': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl185-honey-matera-oak/',
    'ehl201': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl201-light-madjuro-oak/',
    'ehl225': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl225-san-tadeo-oak-natural/',
    'ehl233': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl233-orotava-oak-sand/',
    'ehl235': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl235-baronia-oak-light/',
    'ehl236': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl236-kandy-oak-beige/',
    'ehl239': 'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl239-kandy-oak-brown/',
}

for code, url in MISSING.items():
    filepath = os.path.join(DIR, f"{code}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
        r = subprocess.run(['file', '-b', filepath], capture_output=True, text=True)
        if 'image' in r.stdout.lower():
            print(f"✓ Already have {code}")
            continue
    
    print(f"Fetching {code} from {url}...")
    html = fetch(url)
    if len(html) < 500:
        print(f"  Page too short ({len(html)} bytes), trying variations...")
        # Try without 2026 prefix
        alt_url = url.replace('/home-2026/2026-', '/home/')
        html = fetch(alt_url)
    
    # Find all /upload/iblock/ images
    imgs = re.findall(r'src="(/upload/iblock/[^"]+\.(?:jpg|png|webp))"', html)
    print(f"  Found {len(imgs)} iblock images")
    
    # Skip the first one (usually logo), try the rest
    for img_path in imgs[1:]:  # skip first (logo)
        full_url = f"https://www.egger-russia.ru{img_path}"
        sz = dl(full_url, filepath)
        if sz > 0:
            print(f"  ✓ {code} OK ({sz} bytes) from {img_path}")
            break
    else:
        print(f"  ✗ {code} FAILED")

print("\nFinal check:")
for code in MISSING:
    filepath = os.path.join(DIR, f"{code}.jpg")
    exists = os.path.exists(filepath) and os.path.getsize(filepath) > 5000
    print(f"  {'✓' if exists else '✗'} {code}")

