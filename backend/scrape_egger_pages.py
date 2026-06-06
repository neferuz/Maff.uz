import subprocess
import re
import os

DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/egger'
os.makedirs(DIR, exist_ok=True)

# Map of EHL code -> list of page URLs to try
PAGES = {
    'ehl015': [
        'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl015-toscolano-oak-light/',
        'https://flooringking.co.uk/product/egger-home-12mm-toscolano-light-ehl015/',
    ],
    'ehl032': [
        'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl032-alvados-oak/',
    ],
    'ehl039': [
        'https://dostroydom.by/product/laminat-egger-classic-dub-parketnyy-n2805/',
    ],
    'ehl146': [
        'https://skladremonta.ru/catalog/napolnye_pokrytiya/laminat/laminat_33_klass_egger_pro_home_ehl146_dub_elva_naturalnyy_1292_193_12_mm/',
    ],
    'ehl185': [
        'https://www.egger-russia.ru/products/flooring/home-2026/',  # we'll search
    ],
    'ehl201': [
        'https://www.egger-russia.ru/products/flooring/home-2026/',
    ],
    'ehl225': [
        'https://www.egger-russia.ru/products/flooring/home/ehl225-san-tadeo_oak_natural/',
        'https://www.egger-russia.ru/products/flooring/home-2026/2026-ehl225-san-tadeo-oak-natural/',
    ],
    'ehl233': [
        'https://palas.by/laminat/laminat-egger-home-33-ehl233-dub-orotava-send-classic-v4/',
        'https://diy.by/laminat/laminat-egger-home-33-ehl233-dub-orotava-send-classic-v4/',
    ],
    'ehl235': [
        'https://palas.by/laminat/laminat-egger-home-33-ehl235-dub-baroniya-layt-classic-v4/',
    ],
    'ehl236': [
        'https://palas.by/laminat/laminat-egger-home-33-ehl236-dub-kandi-bezhevyy-classic-v4/',
    ],
    'ehl239': [
        'https://palas.by/laminat/laminat-egger-home-33-ehl239-dub-kandi-braun-classic-v4/',
    ],
}

def fetch_page(url):
    try:
        result = subprocess.run(
            ['curl', '-sL', url, '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '--max-time', '15'],
            capture_output=True, text=True, timeout=20
        )
        return result.stdout
    except:
        return ''

def extract_image_urls(html, code):
    """Extract product image URLs from HTML"""
    images = []
    code_upper = code.upper()
    
    # Find all image URLs
    all_imgs = re.findall(r'(?:src|data-src|data-zoom-image|content|data-large_image)=["\']([^"\']+\.(jpg|jpeg|png|webp))["\']', html, re.IGNORECASE)
    
    # Priority 1: Images with EHL code in URL
    for img, ext in all_imgs:
        if code_upper.lower() in img.lower() or code_upper in img:
            images.append(img)
    
    # Priority 2: Product images (common patterns)
    for img, ext in all_imgs:
        if any(kw in img.lower() for kw in ['product', 'upload', 'catalog', 'dam/', 'fileadmin', 'media/']):
            if not any(kw in img.lower() for kw in ['logo', 'icon', 'banner', 'thumb', 'small', '50x', '100x']):
                images.append(img)
    
    # Priority 3: og:image
    og = re.findall(r'property="og:image"\s+content="([^"]+)"', html)
    images.extend(og)
    
    return images

def download_image(url, filepath):
    try:
        subprocess.run(
            ['curl', '-sL', '-o', filepath, url, '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '--max-time', '15'],
            timeout=20
        )
        size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
        result = subprocess.run(['file', '-b', filepath], capture_output=True, text=True)
        ftype = result.stdout.lower()
        if size > 5000 and 'image' in ftype:
            return True
        else:
            os.remove(filepath) if os.path.exists(filepath) else None
            return False
    except:
        return False

for code, urls in PAGES.items():
    filepath = os.path.join(DIR, f"{code}.jpg")
    if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
        result = subprocess.run(['file', '-b', filepath], capture_output=True, text=True)
        if 'image' in result.stdout.lower():
            print(f"✓ Already have {code}")
            continue
    
    found = False
    for page_url in urls:
        print(f"  Fetching {page_url}...")
        html = fetch_page(page_url)
        if not html:
            continue
        
        img_urls = extract_image_urls(html, code)
        
        for img_url in img_urls[:5]:
            # Make absolute URL
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            elif img_url.startswith('/'):
                from urllib.parse import urlparse
                parsed = urlparse(page_url)
                img_url = f"{parsed.scheme}://{parsed.netloc}{img_url}"
            
            if download_image(img_url, filepath):
                size = os.path.getsize(filepath)
                print(f"✓ {code} downloaded from {img_url} ({size} bytes)")
                found = True
                break
        
        if found:
            break
    
    if not found:
        print(f"✗ {code} - could not extract image")

print("\nDone!")
