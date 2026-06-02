import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== OLD BITRIX PROPERTIES IN IBLOCK 2 ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, CODE FROM b_iblock_property WHERE IBLOCK_ID = 2 LIMIT 100\""
    subprocess.run(cmd, shell=True)

    print("\n=== OLD BITRIX PROPERTIES IN IBLOCK 5 ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, CODE FROM b_iblock_property WHERE IBLOCK_ID = 5 LIMIT 100\""
    subprocess.run(cmd, shell=True)

    # Search in property values for the word 'Silkwood'
    print("\n=== SEARCH PROPERTY VALUES FOR 'Silkwood' ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT * FROM b_iblock_element_property WHERE VALUE LIKE '%Silkwood%' OR VALUE LIKE '%Силквуд%' LIMIT 50\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
