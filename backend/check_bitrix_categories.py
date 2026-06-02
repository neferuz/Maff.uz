import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== OLD BITRIX ELEMENTS MATCHING BAIKAL, ONEGA, VOLGA, KAMA, LADOGA ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, PREVIEW_PICTURE FROM b_iblock_element WHERE NAME LIKE '%Baikal%' OR NAME LIKE '%Байкал%' OR NAME LIKE '%Onega%' OR NAME LIKE '%Онега%' OR NAME LIKE '%Volga%' OR NAME LIKE '%Волга%' OR NAME LIKE '%Kama%' OR NAME LIKE '%Кама%' OR NAME LIKE '%Ladoga%' OR NAME LIKE '%Ладога%' LIMIT 100\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
