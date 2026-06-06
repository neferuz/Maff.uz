import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Searching for Zadoor-related categories...")
        query = "SELECT id, name, parent_id FROM category WHERE name ILIKE '%zadoor%' OR name ILIKE '%art%'"
        res = await conn.execute(text(query))
        rows = res.fetchall()
        for r in rows:
            print(f"ID={r.id} | Name='{r.name}' | Parent_ID={r.parent_id}")

if __name__ == "__main__":
    asyncio.run(main())
