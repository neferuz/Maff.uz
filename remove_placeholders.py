import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # Update products
    res_prod = await conn.execute("UPDATE product SET image_url = NULL WHERE image_url LIKE '%unsplash.com%'")
    print(f"Products updated (removed placeholders): {res_prod}")
    
    # Update categories
    res_cat = await conn.execute("UPDATE category SET image_url = NULL WHERE image_url LIKE '%unsplash.com%'")
    print(f"Categories updated (removed placeholders): {res_cat}")

    await conn.close()

asyncio.run(main())
