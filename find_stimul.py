import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    rows = await conn.fetch("SELECT id, name, category_id FROM product WHERE name ILIKE '%STIMUL%'")
    for r in rows:
        print(dict(r))
    await conn.close()

asyncio.run(main())
