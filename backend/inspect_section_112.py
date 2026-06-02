import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== DUMPING ALL PRODUCTS IN SECTION 112 FROM OLD SITE ===")
    
    # Let's list all elements in section 112 with their details
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, CODE FROM b_iblock_element WHERE IBLOCK_SECTION_ID = 112\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
