import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== OLD BITRIX PRODUCTS IN SECTION 8 (Паркетная доска) ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE FROM b_iblock_element WHERE IBLOCK_SECTION_ID = 8 LIMIT 100\""
    subprocess.run(cmd, shell=True)

    print("\n=== OLD BITRIX PRODUCTS IN SECTION 359 (Инженерно-паркетная доска) ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE FROM b_iblock_element WHERE IBLOCK_SECTION_ID = 359 LIMIT 100\""
    subprocess.run(cmd, shell=True)

    print("\n=== SEARCH OLD PRODUCTS CONTAINING 'Silk' OR 'Силк' OR 'вуд' IN IBLOCK 2 ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE FROM b_iblock_element WHERE IBLOCK_ID = 2 AND (NAME LIKE '%Silk%' OR NAME LIKE '%Силк%' OR NAME LIKE '%wood%' OR NAME LIKE '%вуд%') LIMIT 100\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
