import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== GLOBAL SEARCH FOR SILK ROAD / ШЕЛКОВЫЙ ПУТЬ IN MYSQL ===")
    
    # Let's search all elements in b_iblock_element for Silk Road, Silkroad, Силк Роуд, Шелковый путь
    keywords = ['Silk Road', 'Silkroad', 'Силк Роуд', 'Шелковый путь']
    
    for kw in keywords:
        print(f"\n--- Searching elements matching '{kw}' ---")
        cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, IBLOCK_SECTION_ID FROM b_iblock_element WHERE NAME LIKE '%{kw}%' OR CODE LIKE '%{kw}%' OR XML_ID LIKE '%{kw}%' LIMIT 10\""
        subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
