import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # Try different name variations
    rows = await conn.fetch("SELECT id, name, sku FROM product WHERE name ILIKE '%joss%' OR name ILIKE '%beaumont%' OR name ILIKE '%жосс%'")
    print(f"Found {len(rows)} products for Joss Beaumont.")
    for r in rows[:10]:
        print(f"[{r['id']}] {r['name']} | SKU: {r['sku']}")
        
    await conn.close()

asyncio.run(main())
