import asyncio
import httpx

models = ["odin", "vega", "linear", "zetta", "blade", "fly", "stark", "libra", "jasper", "prizma", "rodin", "sarp", "sinus", "marvel", "maja", "metis", "mimas", "spinal"]
dates = [
    "2018/05",
    "2022/04",
    "2020/04",
    "2021/04",
    "2019/05",
    "2023/04",
    "2024/04"
]

async def check_url(client, url):
    try:
        resp = await client.head(url, timeout=5, follow_redirects=True)
        if resp.status_code == 200:
            print(f"FOUND: {url}")
            return url
    except Exception:
        pass
    return None

async def main():
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient(headers=headers) as client:
        tasks = []
        for model in models:
            for date in dates:
                url_jpg = f"https://www.systemhandle.com/mt-content/uploads/{date}/{model}.jpg"
                url_webp = f"https://www.systemhandle.com/mt-content/uploads/{date}/{model}.webp"
                tasks.append(check_url(client, url_jpg))
                tasks.append(check_url(client, url_webp))
        
        results = await asyncio.gather(*tasks)
        found = [r for r in results if r]
        print(f"\nTotal found: {len(found)}")

if __name__ == "__main__":
    asyncio.run(main())
