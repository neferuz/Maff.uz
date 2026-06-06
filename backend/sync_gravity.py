import paramiko
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    cmd = """
    mysql -D sitemanager -e "
    SELECT e.NAME, f.SUBDIR, f.FILE_NAME
    FROM b_iblock_element e
    LEFT JOIN b_file f ON e.DETAIL_PICTURE = f.ID OR e.PREVIEW_PICTURE = f.ID
    WHERE e.NAME LIKE '%(битум плитка)%';
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    lines = stdout.read().decode().strip().split('\n')
    
    sftp = client.open_sftp()
    
    downloads = []
    out_dir = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/'
    os.makedirs(out_dir, exist_ok=True)
    
    for row in lines[1:]: # skip header
        parts = row.split('\t')
        if len(parts) >= 3:
            name, subdir, file_name = parts[0], parts[1], parts[2]
            if subdir and file_name and subdir != 'NULL':
                remote_path = f'/home/bitrix/www/upload/{subdir}/{file_name}'
                local_filename = f'gravity_{file_name}'
                local_path = os.path.join(out_dir, local_filename)
                try:
                    sftp.get(remote_path, local_path)
                    downloads.append((name, f'/static/uploads/doors/{local_filename}'))
                    print(f"Downloaded {name}")
                except Exception as ex:
                    print(f"Failed to download {name}: {ex}")
                    
    sftp.close()
    
    async def update_db():
        engine = create_async_engine(os.getenv('DATABASE_URL'))
        async with engine.begin() as conn:
            for name, db_path in downloads:
                res = await conn.execute(text("UPDATE product SET image_url = :path WHERE name = :name"), {"path": db_path, "name": name})
                print(f"Updated {res.rowcount} products for {name}")
                
    asyncio.run(update_db())
    
except Exception as e:
    print(f"Error: {e}")
