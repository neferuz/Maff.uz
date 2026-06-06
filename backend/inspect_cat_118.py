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
        res = await conn.execute(text("SELECT id, name, parent_id FROM category WHERE id = 118"))
        cat = res.fetchone()
        if cat:
            print(f"Category 118 Name: '{cat.name}' | Parent_ID: {cat.parent_id}")
            
            # Check grandparent category
            res_grand = await conn.execute(text(f"SELECT id, name, parent_id FROM category WHERE id = {cat.parent_id}"))
            grand = res_grand.fetchone()
            if grand:
                print(f"Category {grand.id} Name: '{grand.name}' | Parent_ID: {grand.parent_id}")

if __name__ == "__main__":
    asyncio.run(main())
