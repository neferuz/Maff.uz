import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    url = "https://egger-eversense-obninsk.clients.site/"
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
        res = await client.get(url)
        print(f"Status Code: {res.status_code}")
        print(f"Content Length: {len(res.text)}")
        
        soup = BeautifulSoup(res.text, 'html.parser')
        print(f"Title: {soup.title.string if soup.title else 'No Title'}")
        
        # Remove scripts/styles
        for s in soup(["script", "style"]):
            s.extract()
            
        text = soup.get_text(separator='\n')
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        print("\nFirst 50 lines of text:")
        for idx, line in enumerate(lines[:50]):
            print(f"  {idx}: {line}")
            
        with open("obninsk_page.html", "w", encoding="utf-8") as f:
            f.write(res.text)

asyncio.run(main())
