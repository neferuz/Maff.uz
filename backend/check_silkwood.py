import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def main():
    print("=== NEW POSTGRESQL SILKWOOD PRODUCTS ===")
    async with AsyncSessionLocal() as session:
        res = await session.execute(text(
            "SELECT id, name, sku, image_url, category_id, brand FROM product "
            "WHERE name ILIKE '%silkwood%' OR brand ILIKE '%silkwood%' OR category_id = 418 LIMIT 100"
        ))
        prods = res.fetchall()
        for r in prods:
            print(f"  ID: {r[0]} | SKU: {r[2]} | Brand: {r[5]} | Cat: {r[4]} | Name: {r[1]} | Image: {r[3]}")

    print("\n=== OLD BITRIX MYSQL PRODUCTS CONTAINING '1029', 'R505', 'R509' or '506' ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, PREVIEW_PICTURE FROM b_iblock_element WHERE NAME LIKE '%1029%' OR NAME LIKE '%R505%' OR NAME LIKE '%R509%' OR NAME LIKE '%506%' LIMIT 100\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
