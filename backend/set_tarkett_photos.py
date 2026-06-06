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
        # ID=5370 -> tarkett_ekstra_solo.jpg
        # ID=5372 -> tarkett_dub_korica.jpg
        # set category_id to 360
        await conn.execute(text("UPDATE product SET category_id = 360, image_url = '/static/uploads/tarkett/tarkett_ekstra_solo.jpg' WHERE id = 5370"))
        await conn.execute(text("UPDATE product SET category_id = 360, image_url = '/static/uploads/tarkett/tarkett_dub_korica.jpg' WHERE id = 5372"))
        print("Updated photos and category for the two Tarkett items.")

asyncio.run(main())
