import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

category_names = [
    "EGGER home", "JOSS BEAUMONT", "Kronopol", "Kronotex", "SWISS KRONO",
    "Ламинат AGT", "Ламинат EGGER Pro", "Ламинат Kronospan", "Ламинат UltraDecor"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for name in category_names:
            query = "SELECT id, name, parent_id, is_active FROM category WHERE name ILIKE :name"
            res = await conn.execute(text(query), {"name": f"%{name}%"})
            rows = res.fetchall()
            print(f"\n--- Search results for category: '{name}' ---")
            for r in rows:
                print(f"ID={r.id} | Name='{r.name}' | Parent_ID={r.parent_id} | Is_Active={r.is_active}")

if __name__ == "__main__":
    asyncio.run(main())
