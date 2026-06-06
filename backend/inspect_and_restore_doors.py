import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

door_ids = [1170, 1171, 1172]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Check category 122 details
        res_cat = await conn.execute(text("SELECT id, name, parent_id FROM category WHERE id = 122"))
        cat = res_cat.fetchone()
        if cat:
            print(f"Category 122 Name: '{cat.name}' | Parent_ID: {cat.parent_id}")
            
        # Let's restore the door products to active
        print("Restoring door products (IDs: 1170, 1171, 1172) to active...")
        restore_query = f"UPDATE product SET is_active = True WHERE id IN ({','.join(map(str, door_ids))})"
        result = await conn.execute(text(restore_query))
        print(f"Successfully restored {result.rowcount} door product(s) to active.")

if __name__ == "__main__":
    asyncio.run(main())
