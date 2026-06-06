import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

TO_ARCHIVE = [
    "Квалитет К11 ALU Black Toppan Дуб натуральный поперечный mb",
    "Квалитет К7 ALU Black Topan Дуб серый продольный",
    "Квалитет К7 (Toppan Орех Шоколад продольный)",
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name in TO_ARCHIVE:
            await conn.execute(text("UPDATE product SET is_active = False WHERE name = :name"), {"name": name})
            print(f"Archived: {name}")

asyncio.run(main())
