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
        for pid in [2895, 3109]:
            sql = f"SELECT id, name, price, image_url FROM product WHERE id = {pid};"
            result = await conn.execute(text(sql))
            for r in result.fetchall():
                print(f"ID: {r[0]} | Name: {r[1]} | Price: {r[2]} | Image: {r[3]}")

asyncio.run(main())
