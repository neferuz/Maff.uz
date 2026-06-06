import asyncio
import os
import re
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

JB_DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/jossbeaumont'

# Remove fake jb_*.jpg files (all 159185 bytes)
for f in os.listdir(JB_DIR):
    if f.startswith('jb_'):
        os.remove(os.path.join(JB_DIR, f))
        
# List real files
real_files = [f for f in os.listdir(JB_DIR) if os.path.getsize(os.path.join(JB_DIR, f)) > 10000]
print(f"Real JB files: {len(real_files)}")
for f in sorted(real_files)[:10]:
    print(f"  {f} ({os.path.getsize(os.path.join(JB_DIR, f))} bytes)")

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Get JB products 
        res = await conn.execute(text("SELECT id, name, image_url FROM product WHERE category_id = 109 AND is_active = True"))
        products = res.fetchall()
        print(f"\nJB products in DB: {len(products)}")
        for p in products:
            print(f"  ID={p[0]} | img={p[2]} | {p[1]}")

asyncio.run(main())
