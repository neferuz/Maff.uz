import asyncio
from playwright.async_api import async_playwright
import json
import os

URLS = [
    ("5241", "https://sargogroup.com/ru/catalog/carpet-tile/ember-stripe-pct-5241"),
    ("5376", "https://sargogroup.com/ru/catalog/carpet-tile/indigo-haze-pct-5376"),
    ("6923", "https://sargogroup.com/ru/catalog/carpet-tile/sage-linen-pct-6923"),
    ("6957", "https://sargogroup.com/ru/catalog/carpet-tile/silver-mist-pct-6957"),
    ("3644", "https://sargogroup.com/ru/catalog/carpet-tile/umber-brassline-pct-3644"),
    ("4144", "https://sargogroup.com/ru/catalog/carpet-tile/copper-weave-pct-4144"),
    ("5236", "https://sargogroup.com/ru/catalog/carpet-tile/amber-trace-pct-5236"),
    ("5253", "https://sargogroup.com/ru/catalog/carpet-tile/cobalt-stripe-pct-5253"),
    ("5269", "https://sargogroup.com/ru/catalog/carpet-tile/shadow-graphite-pct-5269"),
    ("5276", "https://sargogroup.com/ru/catalog/carpet-tile/arctic-current-pct-5276"),
]

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        for code, url in URLS:
            try:
                print(f"Loading {url}")
                await page.goto(url, wait_until='networkidle')
                # Sargo uses img tags. We want the main product image.
                # Usually it has a specific class or it's the largest image.
                # Let's extract all images that contain 'firebasestorage' or look like product images
                imgs = await page.evaluate('''() => {
                    return Array.from(document.querySelectorAll('img')).map(i => i.src).filter(src => src.includes('firebasestorage') || src.includes('http'));
                }''')
                
                # The main product image is usually one of the first few large ones.
                # Let's filter out avatars or logos
                imgs = [i for i in imgs if 'logo' not in i.lower() and 'avatar' not in i.lower()]
                if imgs:
                    print(f"Found image for {code}: {imgs[0]}")
                    results[code] = imgs[0]
                else:
                    print(f"No image found for {code}")
            except Exception as e:
                print(f"Error on {code}: {e}")
        await browser.close()
        
    with open('sargo_imgs.json', 'w') as f:
        json.dump(results, f, indent=2)

asyncio.run(main())
