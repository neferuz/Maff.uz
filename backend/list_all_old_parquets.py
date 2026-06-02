import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== DUMPING ALL PRODUCTS IN PARQUET & MASSIVE FLOOR SECTIONS ON OLD SITE ===")
    
    # We will list all sections under IBLOCK 2 related to flooring to find where they might be stored
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, IBLOCK_SECTION_ID, DETAIL_PICTURE FROM b_iblock_element WHERE IBLOCK_SECTION_ID IN (SELECT ID FROM b_iblock_section WHERE NAME LIKE '%паркет%' OR NAME LIKE '%доска%' OR NAME LIKE '%инженер%' OR NAME LIKE '%пол%') OR NAME LIKE '%паркет%' OR NAME LIKE '%инженер%' OR NAME LIKE '%массив%' LIMIT 100\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
