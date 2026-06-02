import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    url = "https://egger-eversense.clients.site/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        print(f"Status Code: {res.status_code}")
        print(f"Content Length: {len(res.text)}")
        
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Print some interesting parts (like title, meta description, and first few elements)
        print(f"Title: {soup.title.string if soup.title else 'No Title'}")
        
        # Let's find images
        imgs = soup.find_all('img')
        print(f"Found {len(imgs)} images on the main page.")
        for idx, img in enumerate(imgs[:20]):
            print(f"Image {idx}: src={img.get('src')} | alt={img.get('alt')}")
            
        # Let's write the HTML to a file so we can analyze it if needed
        with open("egger_page.html", "w", encoding="utf-8") as f:
            f.write(res.text)
            
asyncio.run(main())
