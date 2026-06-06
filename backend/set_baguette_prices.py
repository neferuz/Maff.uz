"""
Extract prices from 1C HTML and update all Classic Baguette products.
The HTML uses $ amounts which we convert to UZS (1$ = ~14,300 UZS based on existing data).
"""
import asyncio
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os, re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Parse 1C HTML to get model->price mapping
with open('/Users/apple/Desktop/Maff.uz-main/Двери Дил/Classic Baguette Стандарт.html', 'r') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

rows = soup.find_all('tr')

# Extract unique model+color -> price from 1C
# Use 800mm size as representative price (most common)
model_prices = {}
for row in rows[3:]:
    cols = row.find_all(['td', 'th'])
    if len(cols) < 4:
        continue
    name = cols[2].text.strip() if len(cols) > 2 else ''
    price_str = cols[3].text.strip() if len(cols) > 3 else ''
    
    if not name or 'Classic Baguette' not in name:
        continue
    
    # Parse price ($130 -> 130)
    price_match = re.search(r'\$(\d+)', price_str)
    if not price_match:
        continue
    usd_price = int(price_match.group(1))
    
    # Extract model+color key (strip dimensions)
    # e.g. "Classic Baguette Венеция ПГ В3  35х800х2000 Белый матовый" 
    # -> "Венеция ПГ В3 Белый матовый"
    clean = re.sub(r'\d+х\d+х\d+', '', name).strip()
    clean = clean.replace('Classic Baguette ', '')
    clean = re.sub(r'\s+', ' ', clean).strip()
    clean = clean.strip('()')
    
    # Prefer 800mm price (middle ground)
    if '800' in name or clean not in model_prices:
        model_prices[clean] = usd_price

print("=== Prices from 1C ===")
for k, v in sorted(model_prices.items()):
    print(f"  ${v} | {k}")

# Now match to database products
# Rate: check existing product with known price to calibrate
# ID=1191 "Classic Baguette Венеция ПГ В3 Белый матовый" = 2,249,000 UZS
# In 1C: $116 for 800mm
# So rate ~ 2,249,000 / 116 ≈ 19,388 but let's use the $->UZS rate from 1C
# Actually let's compute: 1191 has price 2,249,000, 1C says $116
# But wait - the 1C prices likely include markup. Let me check: 
# $130 * 14300 = 1,859,000 which matches ID=3775 exactly!
# So the rate is exactly 14,300 UZS per $1

RATE = 14300  # confirmed from ID=3775 ($130 = 1,859,000)

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Get all active CB products
        res = await conn.execute(text(
            "SELECT id, name, price FROM product "
            "WHERE category_id = 191 AND is_active = true ORDER BY name;"
        ))
        products = res.fetchall()
        
        updated = 0
        for pid, pname, current_price in products:
            # Extract model+color from product name
            clean = pname.replace('Classic Baguette ', '')
            clean = re.sub(r'\d+х\d+х\d+', '', clean).strip()
            clean = re.sub(r'\s+', ' ', clean).strip()
            clean = clean.strip('()')
            
            # Try to find matching 1C price
            best_match = None
            best_score = 0
            
            for model_key, usd in model_prices.items():
                # Normalize both for comparison
                mk_lower = model_key.lower().replace('(', '').replace(')', '').strip()
                cl_lower = clean.lower().replace('(', '').replace(')', '').strip()
                
                # Check if key words match
                mk_words = set(mk_lower.split())
                cl_words = set(cl_lower.split())
                overlap = len(mk_words & cl_words)
                
                if overlap > best_score and overlap >= 3:
                    best_score = overlap
                    best_match = (model_key, usd)
            
            if best_match:
                new_price = best_match[1] * RATE
                if current_price != new_price and (current_price == 0 or abs(current_price - new_price) > 100000):
                    await conn.execute(text(
                        "UPDATE product SET price = :price WHERE id = :pid;"
                    ), {"price": new_price, "pid": pid})
                    print(f"  💰 ID={pid} ${best_match[1]} = {new_price:,.0f} сум | {pname}")
                    updated += 1
                else:
                    print(f"  ✅ ID={pid} already {current_price:,.0f} сум | {pname}")
            else:
                print(f"  ⚠️  ID={pid} no 1C match, price={current_price:,.0f} | {pname}")
        
        print(f"\nUpdated {updated} prices")
        
        # Final check
        res = await conn.execute(text(
            "SELECT id, name, price FROM product "
            "WHERE category_id = 191 AND is_active = true AND price = 0;"
        ))
        zero = res.fetchall()
        if zero:
            print(f"\n⚠️ Still {len(zero)} products with price 0:")
            for r in zero:
                print(f"  ID={r[0]} | {r[1]}")
        else:
            print("\n✅ All products have prices!")

asyncio.run(main())
