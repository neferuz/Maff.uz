import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    rows = await conn.fetch("SELECT id, name FROM category")
    db_cats = {r['name'].strip().lower(): r['id'] for r in rows}
    prochee_id = db_cats["прочее (из 1с)"]
    
    uncat = await conn.fetch("SELECT id, name FROM product WHERE category_id IS NULL")
    
    updates = 0
    for p in uncat:
        n = p['name'].lower()
        cat_id = prochee_id
        
        if "задор" in n or "zadoor" in n: cat_id = db_cats.get("двери zadoor")
        elif "волховец" in n: cat_id = db_cats.get("двери волховец")
        elif "profil doors" in n: cat_id = db_cats.get("двери zadoor")
        elif "двер" in n and not "фурнитура" in n: cat_id = db_cats.get("двери zadoor")
        
        elif "арбитон" in n or "солид" in n or "плинтус" in n or "русский профиль" in n:
            cat_id = db_cats.get("плинтус")
            if "порог" in n or "русский профиль" in n: cat_id = db_cats.get("пороги")
            
        elif "подложка" in n or "эко пробка" in n: cat_id = db_cats.get("подложка под паркет и ламинат")
        elif "spc" in n: cat_id = db_cats.get("spс")
        elif "ламинат" in n: cat_id = db_cats.get("ламинат")
        elif "паркет" in n: cat_id = db_cats.get("паркетная доска")
        elif "осп" in n or "osb" in n: cat_id = db_cats.get("osb")
        elif "ручк" in n or "петл" in n or "замок" in n or "защелк" in n: cat_id = db_cats.get("ручки stimul")
        
        if not cat_id: cat_id = prochee_id
        
        await conn.execute("UPDATE product SET category_id = $1 WHERE id = $2", cat_id, p['id'])
        updates += 1
        
    print(f"Categorized {updates} products.")
    await conn.close()

asyncio.run(main())
