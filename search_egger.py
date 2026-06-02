import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # Search for products with "egger" or "eversense" in name
    rows = await conn.fetch("SELECT id, name, category_id, image_url FROM product WHERE name ILIKE '%egger%' OR name ILIKE '%eversense%' LIMIT 20")
    print(f"Found {len(rows)} matching products in DB:")
    for r in rows:
        print(f"ID: {r['id']} | Name: {r['name']} | Category: {r['category_id']} | Image: {r['image_url']}")
        
    await conn.close()

asyncio.run(main())
