import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== OLD BITRIX ELEMENT COUNTS BY IBLOCK ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT IBLOCK_ID, COUNT(*) FROM b_iblock_element GROUP BY IBLOCK_ID\""
    subprocess.run(cmd, shell=True)

    print("\n=== OLD BITRIX ELEMENT COUNTS BY SECTION (IBLOCK 2) ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT IBLOCK_SECTION_ID, COUNT(*) FROM b_iblock_element WHERE IBLOCK_ID = 2 GROUP BY IBLOCK_SECTION_ID\""
    subprocess.run(cmd, shell=True)

    print("\n=== OLD BITRIX SECTIONS LIST FOR IBLOCK 2 ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, IBLOCK_SECTION_ID FROM b_iblock_section WHERE IBLOCK_ID = 2\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
