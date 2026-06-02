import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== OLD BITRIX SECTIONS ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, CODE, IBLOCK_ID FROM b_iblock_section WHERE NAME LIKE '%Silkwood%' OR NAME LIKE '%Силквуд%' OR NAME LIKE '%паркет%' OR NAME LIKE '%доска%' LIMIT 100\""
    subprocess.run(cmd, shell=True)

    print("\n=== OLD BITRIX SECTIONS LIST (TOP 50) ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, IBLOCK_ID, IBLOCK_SECTION_ID FROM b_iblock_section LIMIT 50\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
