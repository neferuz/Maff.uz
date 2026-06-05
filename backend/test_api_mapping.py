import asyncio
import urllib.request
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Find some active products with category_id = 449 in DB
        res = await session.execute(text("SELECT id, name, category_id FROM product WHERE category_id = 449 AND is_active = True LIMIT 5"))
        db_prods = res.fetchall()
        print("Products in DB (category_id = 449):")
        for p in db_prods:
            print(f"ID: {p[0]}, Name: '{p[1]}', DB Category: {p[2]}")
            
        if not db_prods:
            print("No active products in category 449 found.")
            return
            
        target_id = db_prods[0][0]
        
        # Now query through API /api/v1/products/{id}
        try:
            url = f"http://127.0.0.1:8000/api/v1/products/{target_id}"
            print(f"\nQuerying API: {url}")
            response = urllib.request.urlopen(url)
            api_data = json.loads(response.read().decode('utf-8'))
            print("API Product Name:", api_data.get("name"))
            print("API Product category_id:", api_data.get("category_id"))
            
            # Let's query products list API filtered by category_id = 448
            list_url = f"http://127.0.0.1:8000/api/v1/products?category_id=448&limit=10"
            print(f"\nQuerying list API: {list_url}")
            response2 = urllib.request.urlopen(list_url)
            api_list = json.loads(response2.read().decode('utf-8'))
            print(f"List returned {len(api_list)} products.")
            found_target = any(p['id'] == target_id for p in api_list)
            print(f"Target product {target_id} found in category 448 list: {found_target}")
            for p in api_list[:3]:
                print(f"  - ID: {p['id']}, Name: '{p['name']}', category_id: {p['category_id']}")
                
        except Exception as e:
            print("API Query Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
