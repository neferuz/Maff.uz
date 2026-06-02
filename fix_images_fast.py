import asyncio
import asyncpg
import hashlib

def get_image_placeholder(name, sku):
    if not name: return None
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
    
    name_lower = str(name).lower()
    is_door = any(k in name_lower for k in ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико', 'baguette'])
    is_hardware = any(k in name_lower for k in ['ручк', 'петл', 'замок', 'упор', 'защелк', 'фиксатор', 'накладка', 'cilind'])
    
    text_to_hash = f"{name}{sku or ''}".encode('utf-8')
    h_idx = int(hashlib.md5(text_to_hash).hexdigest(), 16)
    
    if is_door:
        return door_placeholders[h_idx % len(door_placeholders)]
    elif is_hardware:
        return hardware_placeholders[h_idx % len(hardware_placeholders)]
    else:
        return floor_placeholders[h_idx % len(floor_placeholders)]

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    products = await conn.fetch("SELECT id, name, sku FROM product WHERE image_url IS NULL")
    
    # We will use executemany to make it very fast
    updates = []
    for p in products:
        img = get_image_placeholder(p['name'], p['sku'])
        if img:
            updates.append((img, p['id']))
            
    if updates:
        await conn.executemany("UPDATE product SET image_url = $1 WHERE id = $2", updates)
        print(f"Restored photos for {len(updates)} products using executemany.")
    else:
        print("No products needed images.")
        
    await conn.close()

asyncio.run(main())
