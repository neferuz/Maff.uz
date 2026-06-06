import urllib.request
import re
import ssl
import json

ssl_context = ssl._create_unverified_context()

sku_urls = {
    "80194": [
        "https://mojepodlogi.com/panele-podlogowe-swiss-paloma-aqua-block/5541-dab-umberto-aqua-block-d-80194-ac5-8mm.html",
        "https://vox.pl/product/panele-podlogowe-panele-podlogowe-swiss-krono-platinium-paloma-aqua-block-dab-umberto-d80194-2182688"
    ],
    "4582": [
        "https://vox.pl/product/panele-podlogowe-swiss-krono-aurum-movie-aqua-zero-dab-oskar-d4582-1284676",
        "https://panele-sklepy.pl/dab-oskar-ac5-d-4582-movie-aqua-zero-swiss-krono-aurum-p-4355.html"
    ],
    "4525": [
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-akaba-dab-dalia-4525-aqua-block-gr.8mm-ac4-4v-1opk.9szt.1949-m2"
    ],
    "4590": [
        "https://vox.pl/product/panele-podlogowe-swiss-krono-aurum-fiori-aqua-zero-dab-iris-d4590-1284698",
        "https://panele-sklepy.pl/dab-iris-d-4590-fiori-aqua-zero-swiss-krono-aurum-p-4364.html"
    ],
    "80184": [
        "https://panele-panelex.pl/sklep/kategoria/panele-podlogowe/swiss-krono-platinium/paloma-aqua-block-swiss-krono-platinium/",
        "https://www.swisskrono.com/pl-pl/produkty/podlogi/wszystkie-dekory-podlog/platinium-paloma-aqua-block-24h/dab-mario/"
    ],
    "3884": [
        "https://www.eurofloors.pl/sklep/panele-podlogowe-swiss-krono-aurum-dab-opera-ac5-12mm/",
        "https://www.leroymerlin.pl/produkty/panele-podlogowe-laminowane-swiss-krono-dab-opera-d3884-ac5-12-mm-78361755.html",
        "https://bel-pol.pl/panele-podlogowe/swiss-krono-aurum/panele-podlogowe-dab-opera-d-3884-d-3884%2Cp9233%2C3.html"
    ],
    "4589": [
        "https://www.swisskrono.com/pl-pl/produkty/podlogi/wszystkie-dekory-podlog/aurum-fiori-aqua-zero-72h/dab-dalia/"
    ],
    "4567": [
        "https://vox.pl/product/panele-podlogowe-swiss-krono-platinium-zodiak-dab-capricorn-d4567-1284702",
        "https://www.pan-deska.pl/produkt/swiss-krono-d4567-dab-capricorn-platinium-zodiak-10mm-wysylka-i-podklad-gratis/",
        "https://bel-pol.pl/panele-podlogowe/swiss-krono-platinium/panele-podlogowe-dab-capricorn-d4567-17zo4567%2Cp12960%2C3.html"
    ],
    "4920": [
        "https://panelux.pl/pl/p/4920-DAB-MONTMARTRE-AC58mm-TERRA/12098",
        "https://www.megataniepodlogi.pl/panele-podlogowe/swiss-krono/panele-podlogowe-dab-montmartre-d4920-89vfv4-4920%2Cp23613%2C3.html",
        "https://bel-pol.pl/panele-podlogowe/swiss-krono/panele-podlogowe-dab-montmartre-d4920-89vfv4-4920%2Cp23613%2C3.html"
    ],
    "3941": [
        "https://panelowy.pl/pl/p/Panele-podlogowe-Dab-Charlotte-AC4-8mm-Enigma-Aqua-Block-24h-Swiss-Krono/10109",
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-enigma-dab-charlotte-3941-aqua-block-gr.8mm-ac4-4v-1opk.7szt.2337-m2",
        "https://1000podlog.pl/darmowa-wysylka-kurierska/11441-panele-podlogowe-enigma-aqua-block-dab-charlotte-3941-ac48mm-dostawa-gratis-5903693031656.html"
    ],
    "4579": [
        "https://bel-pol.pl/SWISS-KRONO-Aqua-Zero-panele-wodoodporne-do-24h%2Cap775.html"
    ],
    "3280": [
        "https://1000podlog.pl/panele/8381-panele-podlogowe-platinium-marine-dab-pacyfik-d3280-ac410mm-5901940291204.html",
        "https://www.pan-deska.pl/produkt/swiss-krono-d3280-dab-pacyfik-platinium-marine-10mm/",
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-marine-dab-pacyfik-3280-gr.10mm-ac4-4v-1opk.7szt.1536m2"
    ],
    "3787": [
        "https://panelowy.pl/pl/p/Panele-podlogowe-Dab-Baltyk-AC4-10mm-symbol-D3787-Swiss-Krono-Marine/4422",
        "https://1000podlog.pl/panele/8382-panele-podlogowe-platinium-marine-dab-baltyk-d3787-ac410mm-5901940291198.html",
        "https://www.swisskrono.com/pl-pl/produkty/podlogi/wszystkie-dekory-podlog/platinium-marine/dab-baltyk/"
    ],
    "3486": [
        "https://panelowy.pl/pl/p/Panele-podlogowe-Dab-Debora-AC4-8mm-Akaba-Aqua-Block-24h-Swiss-Krono/10104",
        "https://holz.ua/ua/laminat-kronopol-platinium-akaba-aqua-block-24h-3486wr-dub-debora/",
        "https://chelyabinsk.santehnica.ru/product/497659.html"
    ],
    "3340": [
        "https://1000podlog.pl/darmowa-wysylka-kurierska/11446-panele-podlogowe-enigma-aqua-block-dab-cora-3340-ac48mm-dostawa-gratis-5903693031854.html",
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-enigma-dab-cora-3340-aqua-block-gr.8mm-ac4-4v-1opk.7szt.2337-m2"
    ],
    "4531": [
        "https://mojepodlogi.com/swiss-krono-enigma/7808-swiss-krono-enigma-dab-rose-d4531-ac4-8mm.html",
        "https://bel-pol.pl/panele-podlogowe/swiss-krono-platinium/panele-podlogowe-dab-rose-d4531-pben4531%2Cp23030%2C3.html",
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-enigma-dab-rose-4531-aqua-block-gr.8mm-ac4-4v-1opk.7szt.2337-m2"
    ],
    "3310": [
        "https://panelowy.pl/pl/p/Panele-podlogowe-Wiaz-Ariel-AC5-8mm-Testa-Aqua-Block-24h-Swiss-Krono/10114",
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-testa-wiaz-ariel-3310-aqua-block-gr.8mm-ac5-4v-1opk.9szt.2372m2",
        "https://1000podlog.pl/darmowa-wysylka-kurierska/11447-panele-podlogowe-testa-aqua-block-wiaz-ariel-3310-ac48mm-dostawa-gratis-5903693032134.html"
    ],
    "3710": [
        "https://panelowy.pl/pl/p/Panele-podlogowe-Wiaz-Baruch-AC5-8mm-Testa-Aqua-Block-24h-Swiss-Krono/10115",
        "https://kronodom.pl/panele-podlogowe-swiss-krono-platinium-testa-wiaz-baruch-3710-aqua-block-gr.8mm-ac5-4v-1opk.9szt.2372m2",
        "https://1000podlog.pl/darmowa-wysylka-kurierska/11448-panele-podlogowe-testa-aqua-block-wiaz-baruch-3710-ac48mm-dostawa-gratis-5903693032172.html"
    ],
    "4924": [
        "https://premium-laminate.ru/tovar/laminat-kronopol-platinum-terra-D4924-platan-elisejskij",
        "https://eparket.com/product/laminat-kronopol-platinium-terra-platan-elysees-d-4924-1380-193-8"
    ]
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_og_image(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ssl_context, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Special case for mojepodlogi.com where og:image is the logo, but we want the product image
            if "mojepodlogi.com" in url:
                # Find large_default jpg
                m = re.search(r'"https://mojepodlogi.com/[^"]+large_default/[^"]+\.jpg"', html)
                if m:
                    return m.group(0).replace('"', '')
                m = re.search(r'https://mojepodlogi.com/[^"]+large_default/[^"\'\s>]+', html)
                if m:
                    return m.group(0)

            # Find <meta property="og:image" content="..." />
            m = re.search(r'property="og:image"\s+content="([^"]+)"', html)
            if not m:
                m = re.search(r'content="([^"]+)"\s+property="og:image"', html)
            if not m:
                m = re.search(r'property=\'og:image\'\s+content=\'([^\']+)\'', html)
            if not m:
                # Fallback: search for item image links
                m = re.search(r'itemprop="image"\s+content="([^"]+)"', html)
            
            if m:
                img_url = m.group(1)
                # Resolve relative urls if necessary
                if img_url.startswith('//'):
                    img_url = 'https:' + img_url
                elif img_url.startswith('/'):
                    domain_match = re.match(r'(https?://[^/]+)', url)
                    if domain_match:
                        img_url = domain_match.group(1) + img_url
                return img_url
            
            # Additional fallback: look for large image urls in schema
            schema_match = re.search(r'"image":\s*"([^"]+)"', html)
            if schema_match:
                return schema_match.group(1)
            
            schema_match2 = re.search(r'"image":\s*\[\s*"([^"]+)"', html)
            if schema_match2:
                return schema_match2.group(1)
            
            # Generic image tags
            img_tags = re.findall(r'<img[^>]+src="([^"]+)"', html)
            for src in img_tags:
                if "large" in src or "product" in src or "gfx" in src:
                    if src.startswith('//'):
                        return 'https:' + src
                    elif src.startswith('/'):
                        domain_match = re.match(r'(https?://[^/]+)', url)
                        if domain_match:
                            src = domain_match.group(1) + src
                    return src
            
            return None
    except Exception as e:
        # Don't print stack trace, just return
        return None

results = {}
for code, url_list in sku_urls.items():
    print(f"\nScraping {code}...")
    found = False
    for url in url_list:
        print(f"Trying URL: {url}")
        img = get_og_image(url)
        if img:
            print(f"Found: {img}")
            results[code] = img
            found = True
            break
    if not found:
        print(f"Failed to find image for {code}")

# Manually add known fallback URLs or custom rules if they failed
# For D4589 Fiori Dalia (Swiss Krono PL domain returned 403)
# We can search swiss krono's image CDN or other resources.
# Let's inspect the results first!

with open("scraped_laminates_v2.json", "w") as f:
    json.dump(results, f, indent=2)
print("\nDone! Saved to scraped_laminates_v2.json")
