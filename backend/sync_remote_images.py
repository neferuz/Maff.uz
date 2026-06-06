import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import paramiko

# 1. Fetch from remote DB
host = '192.168.183.35'
remote_data = []

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    command = """sudo -u postgres psql -d maff_db -t -c "SELECT id, image_url FROM product WHERE image_url IS NOT NULL AND image_url != '/products/laminate-1.png';" """
    stdin, stdout, stderr = client.exec_command(command)
    output = stdout.read().decode()
    
    for line in output.split('\n'):
        if '|' in line:
            parts = line.split('|')
            if len(parts) == 2:
                pid_str = parts[0].strip()
                img_url = parts[1].strip()
                if pid_str.isdigit():
                    remote_data.append((int(pid_str), img_url))
                    
    print(f"Found {len(remote_data)} products with images on remote DB.")
    
except Exception as e:
    print(f"Error fetching from remote: {e}")

# 2. Update local DB
from dotenv import load_dotenv
load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    if not remote_data:
        print("No data to update.")
        return
        
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        updated = 0
        for pid, img_url in remote_data:
            res = await conn.execute(text("SELECT image_url FROM product WHERE id = :id"), {"id": pid})
            row = res.fetchone()
            if row:
                local_img = row[0]
                if local_img != img_url:
                    await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": img_url, "id": pid})
                    updated += 1
        print(f"Updated {updated} image URLs in the local DB!")

if remote_data:
    asyncio.run(main())

