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
        res = await conn.execute(text("SELECT id, name FROM category WHERE id = 409"))
        for c in res.fetchall():
            print(f"Cat: ID={c[0]} | {c[1]}")
        
        # also check if 409 is a parent category
        res = await conn.execute(text("SELECT id, name FROM category WHERE parent_id = 409"))
        for c in res.fetchall():
            print(f"Child Cat: ID={c[0]} | {c[1]}")

asyncio.run(main())
