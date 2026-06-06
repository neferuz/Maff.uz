import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# The 14 IDs updated in the previous run
revert_ids = [112, 2992, 2791, 4543, 86, 6265, 6334, 792, 6269, 103, 6494, 6495, 77, 4082]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # 1. Revert all to True first to start clean
        print("Reverting all 14 products to is_active = True...")
        revert_query = f"UPDATE product SET is_active = True WHERE id IN ({','.join(map(str, revert_ids))})"
        await conn.execute(text(revert_query))
        
        # 2. Selectively check each of these 14 products to see which ones are actually laminates.
        print("\nChecking products to identify laminates...")
        select_query = f"SELECT id, name, sku, category_id FROM product WHERE id IN ({','.join(map(str, revert_ids))})"
        res = await conn.execute(text(select_query))
        rows = res.fetchall()
        
        to_archive = []
        for row in rows:
            name_lower = row.name.lower()
            sku_lower = row.sku.lower() if row.sku else ""
            
            # Laminate flooring keywords: "8мм", "10мм", "12мм", "пп", "лп", "дуб", "вяз", "platan", "laminate", "laminat"
            # Exclude doors, stoppers, handles: "упор", "накладка", "дверной", "петли", "замок", "sp66", "filomuro"
            is_laminate = False
            
            # Let's check keywords
            if any(kw in name_lower for kw in ["мм", "дуб", "вяз", "platan", "лп", "akaba", "testa", "terra", "movie", "enigma"]):
                if not any(ex in name_lower for ex in ["упор", "накладка", "дверной", "петли", "замок", "sp66", "filomuro"]):
                    is_laminate = True
            
            if is_laminate:
                to_archive.append(row.id)
                print(f"Laminate to Archive: ID={row.id} | SKU={row.sku} | Name='{row.name}'")
            else:
                print(f"Non-Laminate to KEEP ACTIVE: ID={row.id} | SKU={row.sku} | Name='{row.name}'")
                
        if to_archive:
            print(f"\nArchiving {len(to_archive)} laminate product(s)...")
            archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"
            result = await conn.execute(text(archive_query))
            print(f"Successfully archived {result.rowcount} laminate row(s).")
        else:
            print("\nNo laminate products to archive.")

if __name__ == "__main__":
    asyncio.run(main())
