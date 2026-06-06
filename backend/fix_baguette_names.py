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
        # Fix names of old products without "Classic Baguette" prefix
        fixes = [
            (4991, "Classic Baguette Венеция ПГ В5.3 Белый матовый"),
            (4992, "Classic Baguette Венеция ПО В5.3 (Белый матовый Сатинато с рамкой)"),
        ]
        for pid, new_name in fixes:
            await conn.execute(text("UPDATE product SET name = :name WHERE id = :pid;"), {"name": new_name, "pid": pid})
            print(f"  ✅ Renamed ID={pid} -> {new_name}")
        
        # Verify
        res = await conn.execute(text(
            "SELECT id, name, price, image_url FROM product "
            "WHERE category_id = 191 AND is_active = true ORDER BY name;"
        ))
        rows = res.fetchall()
        print(f"\n=== Final: {len(rows)} active products ===")
        for r in rows:
            has_img = "✅" if r[3] else "❌"
            print(f"  {has_img} ID={r[0]} | {r[1]}")

asyncio.run(main())
