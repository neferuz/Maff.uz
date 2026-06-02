import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== SEARCHING PHYSICAL FILES FOR 'silkwood' IN UPLOADS ===")
    cmd = "find /home/bitrix/www/upload -iname '*silkwood*'"
    subprocess.run(cmd, shell=True)

    print("\n=== SEARCHING PHYSICAL FILES FOR '1029', 'R505', 'R509' IN UPLOADS ===")
    cmd = "find /home/bitrix/www/upload -name '*1029*' -o -name '*R505*' -o -name '*R509*' | head -n 30"
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
