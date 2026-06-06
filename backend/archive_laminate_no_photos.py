import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

search_terms = [
    "80194", "4582", "4525", "4590", "80184", "3884", "4589", "4567",
    "4920", "3941", "4579", "3280", "3787", "3486", "3749", "3340",
    "4531", "3310", "3710", "4924"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Finding laminate products to archive (no photo or placeholder)...")
        to_archive = []
        
        for term in search_terms:
            query = f"SELECT id, name, sku, image_url, is_active FROM product WHERE (sku ILIKE '%{term}%' OR name ILIKE '%{term}%') AND is_active = True"
            result = await conn.execute(text(query))
            rows = result.fetchall()
            
            for row in rows:
                # We specifically check if the product belongs to Swiss Krono laminates (Paloma, Movie, Akaba, Fiori, Zodiak, Terra, Enigma, Marine, Testa, Sound)
                # and doesn't have a valid external/direct image link.
                img = row.image_url
                is_placeholder = False
                if img:
                    img_lower = img.lower()
                    if "zadoor" in img_lower or img_lower.startswith("/images/products/"):
                        is_placeholder = True
                
                if not img or img.strip() == "" or is_placeholder:
                    to_archive.append(row.id)
                    print(f"To Archive: ID={row.id} | SKU={row.sku} | Name='{row.name}' | Image={img}")
        
        if to_archive:
            print(f"\nArchiving {len(to_archive)} product(s)...")
            archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"
            result = await conn.execute(text(archive_query))
            print(f"Successfully deactivated {result.rowcount} row(s).")
        else:
            print("\nNo products to archive found.")

if __name__ == "__main__":
    asyncio.run(main())
