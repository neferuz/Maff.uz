import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    print(f"Connecting to {db_url}")
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        updates = [
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_33_resource.jpg' WHERE name ILIKE '%Классико-33 ПП Alaska%'", "Classico 33"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_83_resource.jpg' WHERE name ILIKE '%Классико-83 ПП Alaska%'", "Classico 83"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_13_1_resource.jpg' WHERE name ILIKE '%Классико-13.1%'", "Classico 13.1"),
            ("UPDATE product SET image_url = '/static/uploads/doors/user_классико-43_эко_ice_milling_white_ii.jpg' WHERE name ILIKE '%Классико-43 ЭКО Ice Milling White II%'", "Classico 43 White II"),
            ("UPDATE product SET image_url = '/static/uploads/doors/classico_43_resource.jpg' WHERE name ILIKE '%Классико-43 ЭКО Ice Milling White I %'", "Classico 43 White I")
        ]
        
        for sql, desc in updates:
            print(f"Executing: {desc}")
            result = await conn.execute(text(sql))
            print(f"Updated {result.rowcount} rows")

asyncio.run(main())
