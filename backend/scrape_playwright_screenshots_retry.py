import asyncio
from playwright.async_api import async_playwright
import os

URLS = [
    ("6923", "https://sargogroup.com/ru/catalog/carpet-tile/sage-linen-pct-6923"),
    ("6957", "https://sargogroup.com/ru/catalog/carpet-tile/silver-mist-pct-6957"),
]

DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/sargo'
os.makedirs(DIR, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        for code, url in URLS:
            try:
                print(f"Loading {url}")
                await page.goto(url, wait_until='networkidle')
                # Give it a second to render
                await page.wait_for_timeout(3000)
                
                filepath = os.path.join(DIR, f"{code}.png")
                # Wait for any image that looks like the product. Or just take a screenshot of the whole page and we can crop it.
                # Usually product pages have a main image area. Let's just grab the first large image or canvas.
                # The page is a SPA. Let's find an element that is likely the image container.
                # "img" tag that isn't logo
                element = await page.evaluate_handle('''() => {
                    const imgs = Array.from(document.querySelectorAll('img'));
                    // sort by size
                    imgs.sort((a,b) => (b.width * b.height) - (a.width * a.height));
                    for (let img of imgs) {
                        if (img.width > 200 && img.height > 200) return img;
                    }
                    return null;
                }''')
                
                if element:
                    await element.as_element().screenshot(path=filepath)
                    print(f"Saved screenshot for {code}")
                else:
                    print(f"No large image found for {code}")
            except Exception as e:
                print(f"Error on {code}: {e}")
        await browser.close()

asyncio.run(main())
