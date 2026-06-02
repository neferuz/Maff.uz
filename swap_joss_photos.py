import asyncio
import asyncpg
import json

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    rows = await conn.fetch("SELECT id, name, images FROM product WHERE images LIKE '%jossbeaumont.ru%'")
    updates = 0
    
    for r in rows:
        try:
            imgs = json.loads(r['images'])
            if len(imgs) >= 2:
                # Swap first two
                imgs[0], imgs[1] = imgs[1], imgs[0]
                
                # New primary image is the new first element
                primary_image = imgs[0]
                images_json = json.dumps(imgs)
                
                await conn.execute("UPDATE product SET image_url = $1, images = $2 WHERE id = $3", primary_image, images_json, r['id'])
                updates += 1
        except Exception as e:
            print(f"Error parsing JSON for product {r['id']}: {e}")
            
    print(f"Successfully swapped photos for {updates} products.")
    await conn.close()

asyncio.run(main())
