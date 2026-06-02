import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== INSPECTING BITRIX SECTIONS / CATEGORIES ===")
    
    # 1. List all sections containing 'Паркет', 'Доска', 'Полы', 'Silk', 'Силк'
    print("\n--- Sections matching parquet/flooring/silk keywords ---")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, IBLOCK_ID, NAME, CODE FROM b_iblock_section WHERE NAME LIKE '%Silk%' OR NAME LIKE '%Силк%' OR NAME LIKE '%Паркет%' OR NAME LIKE '%Доска%' OR NAME LIKE '%Пол%' LIMIT 50\""
    subprocess.run(cmd, shell=True)

    # 2. List unique values of properties where name or description has 'бренд', 'производитель', 'марка'
    print("\n--- Properties matching brand/manufacturer ---")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, IBLOCK_ID, NAME, CODE FROM b_iblock_property WHERE NAME LIKE '%Бренд%' OR NAME LIKE '%Произв%' OR NAME LIKE '%Марка%' OR CODE LIKE '%BRAND%' LIMIT 20\""
    subprocess.run(cmd, shell=True)

    # 3. List all distinct property values for brand properties
    print("\n--- Brand/manufacturer property values ---")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT DISTINCT VALUE FROM b_iblock_element_property WHERE IBLOCK_PROPERTY_ID IN (SELECT ID FROM b_iblock_property WHERE NAME LIKE '%Бренд%' OR NAME LIKE '%Произв%' OR NAME LIKE '%Марка%' OR CODE LIKE '%BRAND%') LIMIT 50\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
