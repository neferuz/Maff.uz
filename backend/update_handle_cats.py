import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get all categories that start with "Дверные ручки" or "Дверные ограничители"
        res = await session.execute(text("SELECT id, name FROM category WHERE name LIKE 'Дверные ручки%' OR name LIKE 'Дверные ограничители%'"))
        categories = res.fetchall()
        
        print("Found categories to update:")
        updates = []
        for cid, name in categories:
            # Clean name
            new_name = name.replace("Дверные ручки ", "").replace("Дверные ограничители ", "").strip()
            print(f"ID={cid}: '{name}' -> '{new_name}'")
            updates.append((cid, new_name))
            
        if not updates:
            print("No categories need updating.")
            return
            
        print("\nUpdating categories...")
        for cid, new_name in updates:
            await session.execute(
                text("UPDATE category SET name = :new_name WHERE id = :cid"),
                {"new_name": new_name, "cid": cid}
            )
        await session.commit()
        print("Successfully updated database category names!")

if __name__ == "__main__":
    asyncio.run(main())
