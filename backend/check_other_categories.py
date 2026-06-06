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
        for cid, name in [(426, "Классико"), (430, "Неоклассико"), (429, "Invisible")]:
            res = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {cid};"))
            print(f"Count in {name} ({cid}): {res.fetchone()[0]}")
            
            # Check how many are stuck in 323 (Двери Portika)
            if name == "Invisible":
                res = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = 323 AND name ILIKE '%Invisible%';"))
            else:
                res = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = 323 AND name ILIKE '{name}%';"))
            print(f"Stuck in parent (323) for {name}: {res.fetchone()[0]}")

asyncio.run(main())
