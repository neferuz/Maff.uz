import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    codes = ['1029', 'R505', 'R509', '506', '001', 'H1']
    print(f"=== SEARCHING BITRIX DB FOR SILKWOOD PARQUET CODES: {codes} ===")

    # 1. Search for elements where NAME, CODE, or XML_ID contains any of the codes
    for code in codes:
        print(f"\n--- Searching elements containing '{code}' ---")
        cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, CODE, DETAIL_PICTURE, PREVIEW_PICTURE FROM b_iblock_element WHERE NAME LIKE '%{code}%' OR CODE LIKE '%{code}%' OR XML_ID LIKE '%{code}%' LIMIT 10\""
        subprocess.run(cmd, shell=True)

    # 2. Search properties table for exact code matches
    print("\n--- Searching element properties for exact code values ---")
    codes_str = ", ".join([f"'{c}'" for c in codes])
    cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT prop.IBLOCK_ELEMENT_ID, el.NAME, prop.IBLOCK_PROPERTY_ID, prop.VALUE, el.DETAIL_PICTURE FROM b_iblock_element_property prop JOIN b_iblock_element el ON el.ID = prop.IBLOCK_ELEMENT_ID WHERE prop.VALUE IN ({codes_str}) LIMIT 50\""
    subprocess.run(cmd, shell=True)

    # 3. Check for any parquet elements in general
    print("\n--- Searching for general parquet element name matches ---")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE FROM b_iblock_element WHERE NAME LIKE '%Silkwood%' OR NAME LIKE '%Силквуд%' LIMIT 10\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
