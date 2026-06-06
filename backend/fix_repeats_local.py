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
        updates = [
            ("UPDATE product SET is_active = false WHERE name ILIKE '%Классико-12 ПП Alaska%'", "Hide 12 Alaska"),
            ("UPDATE product SET is_active = false WHERE name ILIKE '%Классико-13 ПП Alaska%'", "Hide 13 Alaska")
        ]
        
        for sql, desc in updates:
            print(f"Executing: {desc}")
            result = await conn.execute(text(sql))
            print(f"Updated {result.rowcount} rows")

asyncio.run(main())
