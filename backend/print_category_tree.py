import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text("SELECT id, name, parent_id FROM category WHERE is_active=true"))
        categories = res.fetchall()
        
        all_cats = {row[0]: (row[1], row[2]) for row in categories}
        
        # Build tree representation
        tree = {}
        for cid, (name, pid) in all_cats.items():
            tree.setdefault(pid, []).append((cid, name))
            
        def print_tree(pid, level=0):
            if pid not in tree:
                return
            for cid, name in sorted(tree[pid]):
                print("  " * level + f"- ID={cid}: '{name}'")
                print_tree(cid, level + 1)
                
        print("Category Tree:")
        print_tree(None)

if __name__ == "__main__":
    asyncio.run(main())
