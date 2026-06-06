import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.one_c import one_c_service

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    print("Fetching prices and nomenclature from 1C...")
    try:
        # Prices
        prices_1c = await one_c_service.fetch_prices()
        print(f"Fetched {len(prices_1c)} prices from 1C.")
        
        # Nomenclature mapping to names
        noms = await one_c_service.fetch_nomenclatura(top=20000)
        nom_map = {}
        for n in noms:
            nom_map[n.get('Ref_Key')] = n.get('НаименованиеПолное', '') or n.get('Description', '')
            
    except Exception as e:
        print("Failed to fetch from 1C:", e)
        return
        
    price_by_ref = {}
    price_by_name = {}
    
    for item in prices_1c:
        ref_key = item.get("Номенклатура_Key")
        price = item.get("Цена")
        if ref_key and price is not None:
            price_by_ref[ref_key] = float(price)
            if ref_key in nom_map:
                name = nom_map[ref_key].strip()
                if name:
                    price_by_name[name.lower()] = float(price)
                    
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res_prod = await conn.execute(text("SELECT id, name, price, ref_key FROM product"))
        products = res_prod.fetchall()
        
        updated_count = 0
        missing_count = 0
        
        for p in products:
            db_id = p.id
            db_name = (p.name or "").strip()
            db_price = float(p.price or 0)
            db_ref_key = p.ref_key
            
            new_price = None
            if db_ref_key and db_ref_key in price_by_ref:
                new_price = price_by_ref[db_ref_key]
            elif db_name.lower() in price_by_name:
                new_price = price_by_name[db_name.lower()]
                
            if new_price is not None:
                if new_price != db_price:
                    await conn.execute(
                        text("UPDATE product SET price = :price WHERE id = :id"),
                        {"price": new_price, "id": db_id}
                    )
                    updated_count += 1
            else:
                missing_count += 1
                
        print(f"Successfully updated prices for {updated_count} products from 1C.")
        print(f"No price found in 1C for {missing_count} products.")

if __name__ == "__main__":
    asyncio.run(main())
