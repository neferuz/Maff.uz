import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import glob
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

def clean_price(price_str):
    if not price_str:
        return 0.0
    # e.g. "1 500 000" or "1,500,000.00"
    cleaned = "".join(c for c in price_str if c.isdigit() or c == '.')
    try:
        return float(cleaned)
    except:
        return 0.0

async def main():
    engine = create_async_engine(db_url)
    
    # 1. Gather all prices from all HTML files in /Users/apple/Desktop/Maff.uz-main/Двери Дил/
    html_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
    html_files = glob.glob(os.path.join(html_dir, "*.html"))
    
    price_map = {}
    
    for file in html_files:
        print(f"Parsing {os.path.basename(file)}...")
        with open(file, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            rows = soup.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 3:
                    name = cols[1].get_text(strip=True)
                    price_str = cols[2].get_text(strip=True)
                    price = clean_price(price_str)
                    
                    if name and price > 0:
                        name_lower = name.lower()
                        price_map[name_lower] = price

    print(f"Loaded {len(price_map)} valid prices from HTML files.")
    
    # 2. Update DB
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name, price FROM product WHERE is_active = True"))
        products = res.fetchall()
        
        updated_count = 0
        for p in products:
            db_id = p[0]
            db_name = p[1].lower()
            db_price = p[2]
            
            if db_name in price_map:
                new_price = price_map[db_name]
                if new_price != db_price:
                    await conn.execute(text("UPDATE product SET price = :price WHERE id = :id"), {"price": new_price, "id": db_id})
                    updated_count += 1
        print(f"Updated prices for {updated_count} products.")

asyncio.run(main())
