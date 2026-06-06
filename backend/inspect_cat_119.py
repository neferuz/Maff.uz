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
        res = await conn.execute(text("SELECT id, name, parent_id FROM category WHERE id = 119"))
        cat = res.fetchone()
        if cat:
            print(f"Category 119 Name: '{cat.name}' | Parent_ID: {cat.parent_id}")
            
            # Check parent category details
            res_parent = await conn.execute(text(f"SELECT id, name, parent_id FROM category WHERE id = {cat.parent_id}"))
            parent = res_parent.fetchone()
            if parent:
                print(f"Category {parent.id} Name: '{parent.name}' | Parent_ID: {parent.parent_id}")

if __name__ == "__main__":
    asyncio.run(main())
