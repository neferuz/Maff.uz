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
        res = await conn.execute(text("SELECT id, image_url FROM product WHERE image_url LIKE '/static/uploads/%'"))
        rows = res.fetchall()
        print(f"Found {len(rows)} products to fix URL")
        for r in rows:
            new_url = r[1].replace('/static/uploads/', '/api/v1/static/uploads/')
            await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": new_url, "id": r[0]})
        print("Done!")

asyncio.run(main())
