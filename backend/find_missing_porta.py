import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Get all Porta models
        sql = "SELECT id, name, image_url FROM product WHERE category_id IN (SELECT id FROM category WHERE name ILIKE '%Порта%') AND is_active = true;"
        result = await conn.execute(text(sql))
        
        models = {}
        for row in result.fetchall():
            # Clean up the name to group by model
            name = row[1]
            image_url = row[2]
            
            # Extract base model name e.g. Порта-1 ПП Alaska
            base_name = name.split("*")[0].split(" (")[0].strip()
            
            # Invisible doors are grouped separately
            if "Invisible" in name: continue
                
            if base_name not in models:
                models[base_name] = {'has_image': False, 'names': set()}
            
            models[base_name]['names'].add(name)
            if image_url and image_url.strip() != "":
                models[base_name]['has_image'] = True
                
        print("--- NO PHOTOS ---")
        for base_name, data in sorted(models.items()):
            if not data['has_image']:
                print(f"- {base_name}")

asyncio.run(main())
