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
        result = await conn.execute(text("SELECT name FROM product WHERE name ILIKE '%Неоклассико%11%Shellac%White%';"))
        rows = result.fetchall()
        print(f"Shellac White total rows: {len(rows)}")
        for r in rows: print(r[0])

asyncio.run(main())
