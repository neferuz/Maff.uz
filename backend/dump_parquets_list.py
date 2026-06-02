import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== DUMPING ALL PARQUETS FROM BITRIX DB ===")
    
    # Let's list all elements in IBLOCK 2 (which is the catalog iblock) that are in section 8, 359, etc.
    # or that have 'паркет' or 'доска' in their section names.
    # Let's first select all sections in IBLOCK 2
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, CODE FROM b_iblock_section WHERE IBLOCK_ID = 2\""
    print("\n--- All Sections in IBLOCK 2 ---")
    subprocess.run(cmd, shell=True)

    # Let's list elements in parquet sections: section 8 (Паркетная доска) and section 359 (Инженерно-паркетная доска)
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, DETAIL_PICTURE, IBLOCK_SECTION_ID FROM b_iblock_element WHERE IBLOCK_SECTION_ID IN (8, 359) LIMIT 100\""
    print("\n--- All Elements in Parquet Sections (8, 359) ---")
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
