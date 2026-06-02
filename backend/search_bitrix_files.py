import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== SEARCHING BITRIX b_file FOR ORIGINAL FILENAMES ===")
    
    codes = ['1029', '001', '506', 'H1', 'R505', 'R509']
    
    for code in codes:
        print(f"\n--- Searching files matching code '{code}' ---")
        cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, SUBDIR, FILE_NAME, ORIGINAL_NAME, FILE_SIZE FROM b_file WHERE ORIGINAL_NAME LIKE '%{code}%' OR FILE_NAME LIKE '%{code}%' LIMIT 10\""
        subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
