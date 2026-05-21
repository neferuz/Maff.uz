import asyncio
import sys
import os

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.session import AsyncSessionLocal
from app.api.v1.endpoints.products import perform_sync

async def main():
    print("Starting product synchronization from 1C...")
    async with AsyncSessionLocal() as session:
        result = await perform_sync(session)
        print("Sync result:", result)

if __name__ == "__main__":
    asyncio.run(main())
