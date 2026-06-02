import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== OLD BITRIX ELEMENTS CONTAINING 'Silk', 'wood' or 'вуд' ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, PREVIEW_PICTURE FROM b_iblock_element WHERE NAME LIKE '%Silk%' OR NAME LIKE '%wood%' OR NAME LIKE '%вуд%' LIMIT 100\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
