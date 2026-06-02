import asyncio
import sys
from app.db.session import engine
from sqlalchemy import text

async def main():
    print("Database URL:", engine.url)
    async with engine.begin() as conn:
        print("Altering category table to add recommended_accessories column if not exists...")
        await conn.execute(text("ALTER TABLE category ADD COLUMN IF NOT EXISTS recommended_accessories JSON;"))
        print("Alteration completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
