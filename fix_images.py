import asyncio
import asyncpg

door_placeholders = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"
]

floor_placeholders = [
    "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop"
]

hardware_placeholders = [
    "https://images.unsplash.com/photo-1558236894-35222ba3c0e8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585465942738-f14d8ea0a3e8?q=80&w=800&auto=format&fit=crop"
]

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    rows = await conn.fetch("SELECT id, name, category_id, sku FROM product WHERE image_url IS NULL OR image_url = ''")
    
    updates = []
    for r in rows:
        name = r['name'].lower()
        cat_id = r['category_id']
        sku = r['sku'] or ""
        
        # Decide category
        is_door = any(k in name for k in ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико'])
        is_hardware = any(k in name for k in ['ручк', 'петл', 'замок', 'упор', 'защелк', 'фиксатор'])
        
        if is_door:
            h_idx = abs(hash(name + sku)) % len(door_placeholders)
            img = door_placeholders[h_idx]
        elif is_hardware:
            h_idx = abs(hash(name + sku)) % len(hardware_placeholders)
            img = hardware_placeholders[h_idx]
        else:
            # default to floor
            h_idx = abs(hash(name + sku)) % len(floor_placeholders)
            img = floor_placeholders[h_idx]
            
        updates.append((img, r['id']))
        
    if updates:
        await conn.executemany("UPDATE product SET image_url = $1 WHERE id = $2", updates)
        
    print(f"Updated {len(updates)} products with placeholder images.")
    await conn.close()

asyncio.run(main())
