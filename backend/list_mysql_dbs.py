import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== LISTING ALL MYSQL DATABASES ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' -e \"SHOW DATABASES\""
    subprocess.run(cmd, shell=True)

    print("\n=== LISTING ALL TABLES IN SITEMANAGER ===")
    cmd = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -e \"SHOW TABLES LIKE '%iblock%' OR TABLES LIKE '%file%'\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
