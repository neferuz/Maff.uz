import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== SEARCHING ALL OLD PARQUET AND FLOATING FLOOR PRODUCTS ===")
    
    # Let's search all elements in sitemanager that are under IBLOCK 2 (or section 8, 359, etc.)
    # or that have 'Паркет' or 'Паркетная' in their name.
    # We want to print elements matching our codes or look for names containing these codes.
    codes = ['1029', '001', '506', 'H1', 'R505', 'R509']
    
    print("\n--- Searching old DB for elements with parquet/board keywords ---")
    # Let's query elements from old sitemanager
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, IBLOCK_SECTION_ID FROM b_iblock_element WHERE NAME LIKE '%паркет%' OR NAME LIKE '%доска%' OR NAME LIKE '%инженер%' OR NAME LIKE '%массив%' LIMIT 100\""
    subprocess.run(cmd, shell=True)

    print("\n--- Searching for exact matches of our codes in element names/properties ---")
    for code in codes:
        print(f"\n--- Checking code '{code}' ---")
        cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, IBLOCK_SECTION_ID FROM b_iblock_element WHERE NAME LIKE '%{code}%' LIMIT 10\""
        subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
