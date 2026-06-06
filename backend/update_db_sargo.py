import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

CODES = ["5241", "5376", "6923", "6957", "3644", "4144", "5236", "5253", "5269", "5276"]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for code in CODES:
            db_path = f"/static/uploads/sargo/{code}.png"
            res = await conn.execute(text("SELECT id FROM product WHERE name ILIKE :name"), {"name": f"%{code}%"})
            rows = res.fetchall()
            for r in rows:
                await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": r[0]})
                print(f"  ✓ DB updated for {code} (ID: {r[0]})")

asyncio.run(main())
