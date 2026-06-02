import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== SEARCHING PROPERTY VALUES FOR SILKWOOD CODE PATTERNS ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT IBLOCK_ELEMENT_ID, IBLOCK_PROPERTY_ID, VALUE FROM b_iblock_element_property WHERE VALUE = '1029' OR VALUE = 'R505' OR VALUE = 'R509' OR VALUE = '506' OR VALUE = '001' OR VALUE = 'H1' LIMIT 100\""
    subprocess.run(cmd, shell=True)

    # Let's also check if there are any products with matching property values, and show their element names
    print("\n=== RESOLVING ELEMENT NAMES FOR MATCHED PROPERTY VALUES ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT el.ID, el.NAME, prop.IBLOCK_PROPERTY_ID, prop.VALUE, el.DETAIL_PICTURE FROM b_iblock_element el JOIN b_iblock_element_property prop ON el.ID = prop.IBLOCK_ELEMENT_ID WHERE prop.VALUE IN ('1029', 'R505', 'R509', '506', '001', 'H1') LIMIT 100\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
