"""
Extract prices from ALL Portika 1C HTML files and update zero-price products.
"""
import asyncio, re, os
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
RATE = 14300
BASE = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"

def parse_1c_prices(filepath):
    """Parse an 1C HTML file and return {normalized_name: usd_price}"""
    with open(filepath, 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    rows = soup.find_all('tr')
    prices = {}
    for row in rows:
        cols = row.find_all(['td', 'th'])
        if len(cols) < 4:
            continue
        name = cols[2].text.strip() if len(cols) > 2 else ''
        price_str = cols[3].text.strip() if len(cols) > 3 else ''
        if not name:
            continue
        price_match = re.search(r'\$(\d+)', price_str)
        if not price_match:
            continue
        usd = int(price_match.group(1))
        # Normalize: strip dims, extra spaces
        clean = re.sub(r'\d+\s*[хx\*×]\s*\d+\s*[хx\*×]?\s*\d*', '', name).strip()
        clean = re.sub(r'\s+', ' ', clean).strip()
        # Use 800mm as representative (overwrite smaller sizes)
        if '800' in name or clean not in prices:
            prices[clean] = usd
    return prices

# Parse all Portika files
all_prices = {}
for fname in ["Portika Порта.html", "Portika Классико.html", "Portika Неоклассико.html", "Portika Invisible.html"]:
    fpath = os.path.join(BASE, fname)
    if os.path.exists(fpath):
        p = parse_1c_prices(fpath)
        all_prices.update(p)
        print(f"Parsed {fname}: {len(p)} prices")

print(f"\nTotal 1C prices: {len(all_prices)}")

def find_best_price(product_name, prices_dict):
    """Find best matching 1C price for a product name."""
    # Normalize product name
    clean_prod = re.sub(r'\d+\s*[хx\*×]\s*\d+\s*[хx\*×]?\s*\d*', '', product_name).strip()
    clean_prod = re.sub(r'\s+', ' ', clean_prod).strip()
    
    # Try exact match first
    for key, usd in prices_dict.items():
        if clean_prod.lower() == key.lower():
            return usd, key
    
    # Try substring match
    best = None
    best_score = 0
    prod_words = set(clean_prod.lower().replace('(', '').replace(')', '').split())
    
    for key, usd in prices_dict.items():
        key_words = set(key.lower().replace('(', '').replace(')', '').split())
        overlap = len(prod_words & key_words)
        # Need at least 3 matching words
        if overlap > best_score and overlap >= 3:
            best_score = overlap
            best = (usd, key)
    
    return best if best else (None, None)

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Get all zero-price active products in Portika
        cat_ids = [323, 426, 428, 429, 430]
        all_ids = ','.join(str(c) for c in cat_ids)
        res = await conn.execute(text(
            f"SELECT id, name, price, category_id FROM product "
            f"WHERE category_id IN ({all_ids}) AND is_active = true AND price = 0 ORDER BY name;"
        ))
        zero_products = res.fetchall()
        
        updated = 0
        still_zero = []
        for pid, pname, price, cat in zero_products:
            usd, match_key = find_best_price(pname, all_prices)
            if usd:
                new_price = usd * RATE
                await conn.execute(text(
                    "UPDATE product SET price = :price WHERE id = :pid;"
                ), {"price": new_price, "pid": pid})
                print(f"  💰 ID={pid} ${usd} = {new_price:,.0f} | {pname}")
                updated += 1
            else:
                still_zero.append((pid, pname, cat))
        
        print(f"\nUpdated {updated} prices")
        if still_zero:
            print(f"\n⚠️ Still {len(still_zero)} with price=0 (no 1C match):")
            for pid, pname, cat in still_zero:
                print(f"  cat={cat} ID={pid} | {pname}")

asyncio.run(main())
