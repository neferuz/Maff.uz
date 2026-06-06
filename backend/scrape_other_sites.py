import subprocess
import re
import os

DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/egger'

# Clean fake 7746-byte files
for f in os.listdir(DIR):
    fp = os.path.join(DIR, f)
    if os.path.getsize(fp) < 10000:
        os.remove(fp)
        print(f"Removed fake: {f}")

def fetch(url):
    r = subprocess.run(['curl', '-sL', url, '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '--max-time', '15'], capture_output=True, text=True, timeout=20)
    return r.stdout

def dl(url, path):
    subprocess.run(['curl', '-sL', '-o', path, url, '-H', 'User-Agent: Mozilla/5.0', '--max-time', '15'], timeout=20)
    if os.path.exists(path):
        r = subprocess.run(['file', '-b', path], capture_output=True, text=True)
        sz = os.path.getsize(path)
        if sz > 10000 and 'image' in r.stdout.lower():
            return sz
    if os.path.exists(path):
        os.remove(path)
    return 0

# Try non-JS sites
PAGES = {
    'ehl015': ['https://flooringking.co.uk/product/egger-home-12mm-toscolano-light-ehl015/'],
    'ehl032': ['https://hegartys.ie/egger-home-8mm-alvados-oak-2-38.html'],
    'ehl039': ['https://hegartys.ie/egger-home-8mm-parkett-oak-2-38.html'],
    'ehl146': ['https://www.carpetflooringcentre.co.uk/product-page/12mm-egger-home-elva-oak-natural-lvt-laminate-flooring'],
    'ehl185': [],
    'ehl201': [],
    'ehl225': [],
    'ehl233': [],
    'ehl235': [],
    'ehl236': [],
    'ehl239': [],
}

for code, urls in PAGES.items():
    filepath = os.path.join(DIR, f"{code}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 10000:
        print(f"✓ Already have {code}")
        continue
    
    for url in urls:
        print(f"  Trying {code}: {url}")
        html = fetch(url)
        
        # Find product images
        code_upper = code.upper()
        
        # og:image first
        og = re.findall(r'(?:og:image|twitter:image)["\s]+content="([^"]+)"', html)
        
        # Then product images with EHL code
        ehl_imgs = re.findall(r'(?:src|data-src|data-large_image|srcset)="([^"]*' + code_upper + r'[^"]*\.(?:jpg|jpeg|png|webp))', html, re.IGNORECASE)
        
        # WooCommerce pattern
        woo_imgs = re.findall(r'data-large_image="([^"]+)"', html)
        
        # General product images
        prod_imgs = re.findall(r'src="(https?://[^"]+/(?:uploads|products|catalog)[^"]*\.(?:jpg|jpeg|png|webp))"', html, re.IGNORECASE)
        
        all_candidates = ehl_imgs + woo_imgs + og + prod_imgs
        print(f"    Found {len(all_candidates)} candidates")
        
        for img_url in all_candidates[:8]:
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            sz = dl(img_url, filepath)
            if sz > 0:
                print(f"  ✓ {code} OK ({sz} bytes)")
                break
        
        if os.path.exists(filepath) and os.path.getsize(filepath) > 10000:
            break

# For remaining, try praxis.nl and bol.com patterns
PRAXIS = {
    'ehl015': 'https://www.praxis.nl/tegels-vloeren/laminaat/laminaat-planken/egger-laminaatvloeren-ehl015-toscolano-eiken-licht-8mm-1-995m2/10200941',
    'ehl032': 'https://www.praxis.nl/tegels-vloeren/laminaat/laminaat-planken/egger-laminaatvloeren-ehl032-alvados-eiken-8mm-1-995m2/10200938',
    'ehl039': 'https://www.praxis.nl/tegels-vloeren/laminaat/laminaat-planken/egger-laminaatvloeren-ehl039-parket-eiken-8mm-1-995m2/10200939',
}

for code, url in PRAXIS.items():
    filepath = os.path.join(DIR, f"{code}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 10000:
        continue
    
    print(f"  Trying praxis for {code}...")
    html = fetch(url)
    imgs = re.findall(r'src="(https?://[^"]+\.(?:jpg|jpeg|png))"', html)
    imgs = [i for i in imgs if 'product' in i.lower() or 'media' in i.lower()]
    for img_url in imgs[:5]:
        sz = dl(img_url, filepath)
        if sz > 0:
            print(f"  ✓ {code} from praxis ({sz} bytes)")
            break

print("\n=== Final status ===")
for code in ['ehl015', 'ehl032', 'ehl039', 'ehl146', 'ehl185', 'ehl201', 'ehl225', 'ehl233', 'ehl235', 'ehl236', 'ehl239']:
    filepath = os.path.join(DIR, f"{code}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 10000:
        print(f"  ✓ {code} ({os.path.getsize(filepath)} bytes)")
    else:
        print(f"  ✗ {code} MISSING")

