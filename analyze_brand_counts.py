import asyncio
import asyncpg

BRANDS = [
    "AGT", "Ultradecor", "Kronotex", "Kronopol", "System", "Portika", 
    "Za-Door", "Волховец", "Volhovec", "Coswick", "Egger", "Arbiton", 
    "Solid", "Tarwood", "Gapsys"
]

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # Check total products for each brand (case-insensitive search in name)
    print("Product counts by brand in our database:")
    print("-" * 50)
    for brand in BRANDS:
        # We search in product name or we could join category name, but product name is a good proxy
        count = await conn.fetchval(
            "SELECT count(*) FROM product WHERE name ILIKE $1", f"%{brand}%"
        )
        # For Egger we also have EverSense (done), but let's see Egger overall
        # For Ultradecor, sometimes written in Russian "Ультрадекор"
        # For Portika, "Портика"
        # For Za-door, "Za-door"
        # Let's add Russian equivalents
        ru_brand = None
        if brand == "Ultradecor": ru_brand = "Ультрадекор"
        elif brand == "Portika": ru_brand = "Портика"
        elif brand == "System": ru_brand = "Систем"
        elif brand == "Arbiton": ru_brand = "Арбитон"
        elif brand == "Solid": ru_brand = "Солид"
        elif brand == "Tarwood": ru_brand = "Тарвуд"
        elif brand == "Coswick": ru_brand = "Косвик"
        elif brand == "Egger": ru_brand = "Эггер"
        
        if ru_brand:
            ru_count = await conn.fetchval("SELECT count(*) FROM product WHERE name ILIKE $1", f"%{ru_brand}%")
            count += ru_count
            
        print(f"{brand:<15}: {count} products")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
