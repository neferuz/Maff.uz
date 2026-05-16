import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def upgrade_db():
    async with AsyncSessionLocal() as db:
        cols = [
            ("brand", "VARCHAR"),
            ("country", "VARCHAR"),
            ("grade", "VARCHAR"),
            ("thickness", "VARCHAR"),
            ("pack_size", "FLOAT"),
            ("images", "JSON")
        ]
        
        for col_name, col_type in cols:
            print(f"Adding column {col_name}...")
            try:
                await db.execute(text(f"ALTER TABLE product ADD COLUMN {col_name} {col_type};"))
                await db.commit()
                print(f"Successfully added {col_name}.")
            except Exception as e:
                print(f"Note: {col_name} probably exists or error: {e}")
                await db.rollback()

if __name__ == "__main__":
    asyncio.run(upgrade_db())
