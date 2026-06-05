import asyncio
import httpx

candidates = [
    # Despina
    "https://www.systemhandle.com/mt-content/uploads/2018/05/despina.jpg",
    "https://www.systemhandle.com/mt-content/uploads/2018/05/despina.webp",
    "https://www.systemhandle.com/mt-content/uploads/2022/04/despina.jpg",
    # Odin
    "https://www.systemhandle.com/mt-content/uploads/2018/05/odin.jpg",
    "https://www.systemhandle.com/mt-content/uploads/2018/05/odin.webp",
    "https://www.systemhandle.com/mt-content/uploads/2022/04/odin.jpg",
    # Zetta (HA194)
    "https://www.systemhandle.com/mt-content/uploads/2018/05/zetta.jpg",
    "https://www.systemhandle.com/mt-content/uploads/2018/05/zetta.webp",
    "https://www.systemhandle.com/mt-content/uploads/2022/04/zetta.jpg",
    "https://www.sese.com.tr/system-zetta-kapi-kolu-krom-renk-ha194ro11-cr-38551-13-K.jpg", # similar pattern to gamma
    # Vega (HA234)
    "https://www.systemhandle.com/mt-content/uploads/2018/05/vega.jpg",
    "https://www.systemhandle.com/mt-content/uploads/2018/05/vega.webp",
    "https://www.systemhandle.com/mt-content/uploads/2022/04/vega.jpg",
    # Linear (HA229)
    "https://www.systemhandle.com/mt-content/uploads/2018/05/linear.jpg",
    "https://www.systemhandle.com/mt-content/uploads/2018/05/linear.webp",
    "https://www.systemhandle.com/mt-content/uploads/2022/04/linear.jpg",
]

async def verify():
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(headers=headers) as client:
        for url in candidates:
            try:
                resp = await client.head(url, timeout=5, follow_redirects=True)
                print(f"URL: {url} | Status: {resp.status_code}")
            except Exception as e:
                print(f"URL: {url} | Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
