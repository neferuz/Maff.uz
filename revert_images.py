import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # Update where image_url is an unsplash placeholder
    res = await conn.execute("UPDATE product SET image_url = NULL WHERE image_url LIKE '%unsplash.com%'")
    print(f"Reverted {res} placeholder images.")
    
    await conn.close()

asyncio.run(main())
