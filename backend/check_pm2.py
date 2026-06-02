import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== REMOTE PM2 STATUS ===")
    cmd = "pm2 list"
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
