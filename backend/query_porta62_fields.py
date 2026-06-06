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
        sql = "SELECT * FROM product WHERE id = 3109;"
        result = await conn.execute(text(sql))
        for r in result.mappings().all():
            print(dict(r))

asyncio.run(main())
