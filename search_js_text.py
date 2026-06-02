import asyncio
import httpx
import re

async def scan_chunk(client, chunk_name):
    url = f"https://client-site.s3.yandex.net/r19640913/_next/static/chunks/{chunk_name}"
    try:
        res = await client.get(url)
        if res.status_code == 200:
            js = res.text
            # Search for occurrences of api/v1 or business or goods or services
            matches = re.findall(r'([^\'\"`]{0,50}(?:goods|services|catalog|api/v1|yandex\.ru)[^\'\"`]{0,50})', js, re.IGNORECASE)
            if matches:
                print(f"\nChunk {chunk_name} matches: {len(matches)}")
                for m in set(matches[:15]):
                    print(f"  {repr(m.strip())}")
    except Exception as e:
         pass

async def main():
    chunks = [
        "1255-aed1538840402354.js",
        "2850-6c42318db785c3b0.js",
        "6961-1f1d293adcf1e8ee.js",
        "8712-7edcc46879bfc3c5.js",
        "5314-7368a5ede2f7e235.js",
        "5640-ef7f2f337112b565.js",
        "1460-60be28976187658e.js",
        "2619-f1d89ff25d87df5d.js",
        "7512-93be8bd3073e72ee.js",
        "6726-48b143876137126f.js",
        "2858-45a5b8a881842f56.js",
        "6863-ebccac389ebb1566.js",
        "4076-b0eaa0f3a6af778b.js",
        "2513-b08ea9c3e4778f7d.js",
        "3273-c4de1f024d94ccb6.js",
        "app/page-08ce5b3ef55ef0b0.js"
    ]
    async with httpx.AsyncClient(timeout=15.0) as client:
        for chunk in chunks:
            await scan_chunk(client, chunk)

asyncio.run(main())
