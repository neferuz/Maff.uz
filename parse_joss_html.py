import asyncio
import httpx

async def main():
    url = "https://jossbeaumont.ru/catalog/kollektsiya_liberte/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url)
        print("Length:", len(res.text))
        print(res.text[:500])

asyncio.run(main())
