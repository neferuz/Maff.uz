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
        sql = "UPDATE product SET is_active = true WHERE category_id = 428;"
        res = await conn.execute(text(sql))
        print(f"Reactivated all {res.rowcount} Porta products.")

asyncio.run(main())
