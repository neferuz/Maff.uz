import asyncio
import httpx
from bs4 import BeautifulSoup

async def main():
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "max-age=0",
        "Connection": "keep-alive"
    }
    
    url = "https://egger-eversense.clients.site/"
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
        res = await client.get(url)
        print(f"Main Page | Status: {res.status_code} | Length: {len(res.text)}")
        
        soup = BeautifulSoup(res.text, 'html.parser')
        print(f"Main Title: {soup.title.string if soup.title else 'No Title'}")
        
        # Now let's try /goods/ with the same headers
        res_goods = await client.get("https://egger-eversense.clients.site/goods/")
        print(f"Goods Page | Status: {res_goods.status_code} | Length: {len(res_goods.text)}")
        
        soup_goods = BeautifulSoup(res_goods.text, 'html.parser')
        print(f"Goods Title: {soup_goods.title.string if soup_goods.title else 'No Title'}")
        
        # Check if there is captcha
        for s in soup_goods(["script", "style"]):
            s.extract()
        txt = soup_goods.get_text().strip()
        print(f"Goods text snippet: {txt[:200]}")
        
        with open("egger_goods.html", "w", encoding="utf-8") as f:
            f.write(res_goods.text)

asyncio.run(main())
