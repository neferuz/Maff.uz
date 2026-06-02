import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    names = ["МИЛФЕЙ", "ШОДО", "ПРОФИТРОЛЬ", "КРОКЕМБУШ", "КАНЕЛЕ", "БЛАМАНЖЕ"]
    for n in names:
        rows = await conn.fetch("SELECT id, name, sku FROM product WHERE name ILIKE $1", f'%{n}%')
        if rows:
            print(f"Found {len(rows)} for {n}:")
            for r in rows:
                print(f"[{r['id']}] {r['name']} | SKU: {r['sku']}")
        else:
            print(f"Not found: {n}")
            
    await conn.close()

asyncio.run(main())
