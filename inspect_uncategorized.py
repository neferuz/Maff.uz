import asyncio
import asyncpg
import pandas as pd

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    rows = await conn.fetch("SELECT id, name, sku, ref_key FROM product WHERE category_id IS NULL LIMIT 20")
    
    for r in rows:
        print(f"[{r['id']}] {r['name']} (SKU: {r['sku']}) -> Ref: {r['ref_key']}")
        
    await conn.close()

asyncio.run(main())
