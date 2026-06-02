import asyncio
import asyncpg
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # 1. Get AGT products from DB
    rows = await conn.fetch("""
        SELECT p.id, p.sku, p.name
        FROM product p
        JOIN category c ON p.category_id = c.id
        WHERE c.name ILIKE ANY(array['%AGT%', '%Concept Neo%', '%Effect%', '%Metal%', '%Natura Line%', '%Pruva%', '%Bella Neo%', '%Armonia%'])
    """)
    print(f"Loaded {len(rows)} AGT products from DB.")
    
    # 2. Get URLs from sitemap
    with open("agt_tr_urls.txt", "r") as f:
        urls = [line.strip() for line in f if line.strip()]
        
    print(f"Loaded {len(urls)} URLs from sitemap.")
    
    # 3. Match
    matched = 0
    for r in rows:
        name = r['name']
        # The color name is usually at the end. 
        # Example: "Effect 8мм PRK912 1,200*0,191 Effect Solaro" -> "Solaro" or "Effect Solaro"
        # We can extract English words from the name as the color name.
        english_words = re.findall(r'[a-zA-Z]+', name)
        # Filter out common terms like PRK912, LB, Group, Matt, Bute, mm, Oak, etc. (Wait, Oak is part of the name)
        filtered_words = [w for w in english_words if w.lower() not in ['group', 'matt', 'bute', 'supramat', 'effect', 'natura', 'line', 'concept', 'neo', 'lb', 'prk']]
        # Ignore SKUs
        filtered_words = [w for w in filtered_words if not re.match(r'^prk\d+$', w.lower()) and not re.match(r'^\d+$', w)]
        
        if not filtered_words:
            continue
            
        # Try to find a URL that contains these words
        search_slug = "-".join([w.lower() for w in filtered_words[-3:]]) # last 3 words
        search_slug_2 = "-".join([w.lower() for w in filtered_words[-2:]])
        search_slug_1 = filtered_words[-1].lower()
        
        best_match = None
        for url in urls:
            if search_slug in url and len(search_slug) > 3:
                best_match = url
                break
            elif search_slug_2 in url and len(search_slug_2) > 3:
                best_match = url
                break
            elif search_slug_1 in url and f"/{search_slug_1}" in url:
                best_match = url
                break
                
        if best_match:
            matched += 1
            print(f"MATCH: {name} -> {best_match}")
            
    print(f"Total matched: {matched} / {len(rows)}")
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
