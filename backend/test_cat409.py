import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name FROM product WHERE category_id = 409"))
        rows = res.fetchall()
        
    print(f"Found {len(rows)} products in category 409.")
    for r in rows[:10]:
        print(f"[{r.id}] {r.name}")

asyncio.run(main())
