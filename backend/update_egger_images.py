import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    
    # Read mappings from egger_images.json
    with open('egger_images.json', 'r') as f:
        mappings = json.load(f)
        
    async with engine.begin() as conn:
        print("Updating Egger product images and activating them...")
        
        for sku, url in mappings.items():
            if url:
                # Update image and set active
                query = """
                    UPDATE product 
                    SET image_url = :url, is_active = True 
                    WHERE sku ILIKE :sku OR name ILIKE :sku
                """
                res = await conn.execute(text(query), {"url": url, "sku": f"%{sku}%"})
                print(f"SKU: {sku} -> Updated {res.rowcount} product(s) with image: {url}")
            else:
                # Keep active as False if they were archived previously
                print(f"SKU: {sku} -> No photo URL. Kept archived (is_active = False)")

if __name__ == "__main__":
    asyncio.run(main())
