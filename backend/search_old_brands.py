import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== SEARCHING BITRIX DB FOR OTHER PREMIUM PARQUET BRANDS ===")
    
    brands = ['Coswick', 'Косвик', 'Haro', 'Харо', 'Tarwood', 'Тарвуд']
    
    for brand in brands:
        print(f"\n--- Searching elements matching '{brand}' ---")
        cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, IBLOCK_SECTION_ID FROM b_iblock_element WHERE NAME LIKE '%{brand}%' LIMIT 15\""
        subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
