import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Mapping of SKU to image URL
image_mapping = {
    "LB 2050 369": "https://www.agtwood.com/medium/ProductColorItem/Image/fcaf65af-90df-4497-abac-3d332350cfd6",
    "LB 2050 390": "https://www.agtwood.com/medium/Product/Image/c2fdb730-9503-4ea5-92de-bd88c4fd2e6a",
    "LB 2050 3063": "https://www.agtwood.com/medium/ProductColorItem/Image/fb0731db-ec58-404b-9357-aa8765da8a78",
    "LB 2050 3019": "https://images.squarespace-cdn.com/content/v1/605e0c3843e6fc757f92eb03/339a38d4-d3f0-4848-8298-ebe3362afdf8/2050-3019.png",
    "LB 2050 3023": "https://www.agtwood.com/medium/ProductColorItem/Image/8a385655-4094-4c8f-99e4-bc711ea94182",
    "LB 2200-Y 248": "https://www.agtwood.com/medium/ProductColorItem/Image/36753420-e6aa-46ab-8630-c6dd2c8aedc5",
    "LB 2200-Y 397": "https://static.wixstatic.com/media/0ef2b0_e190a08fd60343b6b0b38cd30cfea920~mv2.png/v1/fill/w_980%2Ch_980%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/2200%20Natural%20Oak%20397.png",
    "LB 3771 248": "https://static.wixstatic.com/media/0ef2b0_fa53272e9f8843099ce33f06805c4046~mv2.png/v1/fill/w_980%2Ch_980%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/3771%20Teak%20248.png",
    "LB 3771 723": "https://www.agtwood.com/medium/ProductColorItem/Image/31d6d065-5a09-4598-b132-f9d3e3ff6ba6",
    "LB 3771 734": "https://www.agtwood.com/medium/ProductColorItem/Image/ce0b4cff-c9d5-4b39-8325-46842b54fe9a",
    "LB 3783 231": "https://www.agtwood.com/medium/ProductColorItem/Image/3325b8af-1c03-4959-a2dc-adce1d5657e3",
    "LB 3783 3037": "https://www.agtwood.com/medium/ProductColorItem/Image/dbf35820-0f85-4cf9-873d-b45772ea03e4",
    "LB 3783 3019": "https://www.agtwood.com/medium/ProductColorItem/Image/638847e2-ef7b-4155-9717-752c7ed34008",
    "LB 5014 248": "https://www.agtwood.com/medium/ProductColorItem/Image/36753420-e6aa-46ab-8630-c6dd2c8aedc5",
    "LB 3783-B 3037": "https://www.agtwood.com/medium/ProductColorItem/Image/dbf35820-0f85-4cf9-873d-b45772ea03e4",
    "LB 2050-A 3019": "https://images.squarespace-cdn.com/content/v1/605e0c3843e6fc757f92eb03/72dca368-e99c-4118-9efa-3a4766218ccb/LB-2050%2BA.png",
    "LB 2050-B 3019": "https://images.squarespace-cdn.com/content/v1/605e0c3843e6fc757f92eb03/4e96d3da-6683-4597-880b-59edcddb61c0/LB-2050%2BB.png",
    "LB 2050-B 3023": "https://www.agtwood.com/medium/ProductColorItem/Image/8a385655-4094-4c8f-99e4-bc711ea94182",
    "LB 3771 3011": "https://www.agtwood.com/medium/ProductColorItem/Image/9fc0e70f-7645-4c14-bce6-9355b377bd49",
    "LB 3783 3029": "https://www.agtwood.com/medium/ProductColorItem/Image/9b8f6f73-43b2-44c4-be97-83e1c646c8cf",
    "LB 3783-A 3029": "https://www.agtwood.com/medium/ProductColorItem/Image/9b8f6f73-43b2-44c4-be97-83e1c646c8cf",
    "LB 3783-B 3029": "https://www.agtwood.com/medium/ProductColorItem/Image/9b8f6f73-43b2-44c4-be97-83e1c646c8cf",
    "LB 3821-A 3016": "https://steropal.gr/77-large_default/2800122018-agt-supramat-3016-pink-daisy.jpg",
    "LB 3821-A 3029": "https://www.agtwood.com/medium/ProductColorItem/Image/9b8f6f73-43b2-44c4-be97-83e1c646c8cf",
}

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Starting updates with TRIM...")
        for sku, url in image_mapping.items():
            query = "UPDATE product SET image_url = :url WHERE TRIM(sku) = :sku"
            result = await conn.execute(text(query), {"url": url, "sku": sku})
            print(f"SKU: {sku} -> Updated {result.rowcount} row(s)")

if __name__ == "__main__":
    asyncio.run(main())
