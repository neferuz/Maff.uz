import asyncio
import asyncpg
import hashlib

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    placeholders = [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop"
    ]

    rows = await conn.fetch("SELECT id, name FROM category WHERE image_url LIKE '/static/%'")
    for r in rows:
        h_idx = int(hashlib.md5(r['name'].encode()).hexdigest(), 16) % len(placeholders)
        img_url = placeholders[h_idx]
        await conn.execute("UPDATE category SET image_url = $1 WHERE id = $2", img_url, r['id'])
        print(f"Fixed image for category: {r['name']}")
        
    print(f"Fixed {len(rows)} category images.")
    await conn.close()

asyncio.run(main())
