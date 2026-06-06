import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Add parent dir to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.one_c import one_c_service

load_dotenv()
db_url = os.getenv('DATABASE_URL')

target_models = [
    "Неаполь",
    "Коробка телескопическая",
    "Наличник телескопический",
    "Доборный брус",
    "Zadoor"
]

async def main():
    print("Fetching prices from 1C...")
    try:
        prices_1c = await one_c_service.fetch_prices()
        print(f"Fetched {len(prices_1c)} prices from 1C.")
    except Exception as e:
        print("Failed to fetch prices from 1C:", e)
        return
        
    price_map = {}
    for item in prices_1c:
        ref_key = item.get("Номенклатура_Key")
        price = item.get("Цена")
        if ref_key and price is not None:
            price_map[ref_key] = float(price)
            
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res_prod = await conn.execute(text("SELECT id, name, price, ref_key, category_id FROM product WHERE ref_key IS NOT NULL"))
        products = res_prod.fetchall()
        
        updated_count = 0
        
        for p in products:
            db_id = p.id
            db_name = p.name
            db_price = p.price
            db_ref_key = p.ref_key
            
            # Check if product is Zadoor/Neapol
            is_zadoor = False
            for model in target_models:
                if model.lower() in db_name.lower():
                    is_zadoor = True
                    break
                    
            if is_zadoor and db_ref_key in price_map:
                new_price = price_map[db_ref_key]
                if float(new_price) != float(db_price or 0):
                    await conn.execute(
                        text("UPDATE product SET price = :price WHERE id = :id"),
                        {"price": new_price, "id": db_id}
                    )
                    updated_count += 1
                    
        print(f"Successfully updated prices for {updated_count} Zadoor products from 1C.")

if __name__ == "__main__":
    asyncio.run(main())
