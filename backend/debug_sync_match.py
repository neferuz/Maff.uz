import asyncio
import paramiko
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

ssh_host = '192.168.183.35'
ssh_user = 'root'
ssh_pass = 'rJhj,rf2@'

async def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ssh_host, username=ssh_user, password=ssh_pass, timeout=15)
    
    query = """
    mysql -D sitemanager -B -N -e "
    SELECT 
        el.ID, 
        el.NAME, 
        prop.VALUE,
        f.SUBDIR,
        f.FILE_NAME
    FROM b_iblock_element el
    LEFT JOIN b_iblock_element_property prop ON el.ID = prop.IBLOCK_ELEMENT_ID AND prop.IBLOCK_PROPERTY_ID = 112
    LEFT JOIN b_file f ON el.DETAIL_PICTURE = f.ID OR el.PREVIEW_PICTURE = f.ID
    WHERE el.IBLOCK_ID = 2;
    "
    """
    stdin, stdout, stderr = client.exec_command(query)
    output = stdout.read().decode('utf-8')
    client.close()
    
    bitrix_prods = []
    for line in output.strip().split('\n'):
        if not line:
            continue
        parts = line.split('\t')
        if len(parts) < 5:
            parts += [None] * (5 - len(parts))
        el_id, name, sku, subdir, filename = parts[:5]
        
        sku_val = sku if sku and sku != "NULL" else None
        img_path = f"/upload/{subdir}/{filename}" if subdir and filename and subdir != "NULL" and filename != "NULL" else None
        
        bitrix_prods.append({
            "bitrix_id": el_id,
            "name": name,
            "sku": sku_val,
            "image_path": img_path
        })
        
    # Test specific PG product ID 953
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name, sku FROM product WHERE id = 953"))
        p = res.fetchone()
        
        print(f"PostgreSQL Product: ID={p.id} | Name='{p.name}' | SKU='{p.sku}'")
        
        p_sku = p.sku.strip() if p.sku else ""
        p_name_clean = re.sub(r'[^a-z0-9]', '', p.name.lower())
        
        # Trace SKU matches
        print("\nTracing SKU Matches:")
        for bp in bitrix_prods:
            bp_sku = bp["sku"].strip() if bp["sku"] else ""
            if bp_sku and (p_sku.lower() in bp_sku.lower() or bp_sku.lower() in p_sku.lower()):
                print(f"  SKU MATCH found: Bitrix ID={bp['bitrix_id']} | Name='{bp['name']}' | SKU='{bp['sku']}'")
                
        # Trace Name matches
        print("\nTracing Name Matches:")
        for bp in bitrix_prods:
            bp_name_clean = re.sub(r'[^a-z0-9]', '', bp["name"].lower())
            # Skip empty clean names
            if not bp_name_clean or not p_name_clean:
                continue
            if p_name_clean in bp_name_clean or bp_name_clean in p_name_clean:
                print(f"  NAME MATCH found: Bitrix ID={bp['bitrix_id']} | Name='{bp['name']}' | bp_clean='{bp_name_clean}' | p_clean='{p_name_clean}'")
                break

if __name__ == "__main__":
    asyncio.run(main())
