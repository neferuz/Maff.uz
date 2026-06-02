import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    rows = await conn.fetch("SELECT id, name, sku FROM product WHERE name ILIKE '%libert%' OR name ILIKE '%либерт%'")
    print(f"Found {len(rows)} products for Liberte.")
    for r in rows:
        print(f"[{r['id']}] {r['name']} | SKU: {r['sku']}")
    await conn.close()

asyncio.run(main())
