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
remote_path = '/home/bitrix/ext_www/sitemanager/upload/iblock/f51/g19dtsi1p7a31m1k5n8skl1p3kgfz6nk.jpg'
local_path = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/osb_image.jpg'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    sftp = client.open_sftp()
    sftp.get(remote_path, local_path)
    sftp.close()
    print("Downloaded OSB image.")
    
    async def update_db():
        engine = create_async_engine(os.getenv('DATABASE_URL'))
        async with engine.begin() as conn:
            res = await conn.execute(text("UPDATE product SET image_url = '/static/uploads/doors/osb_image.jpg' WHERE category_id = 315"))
            print(f"Updated {res.rowcount} OSB products.")
            
    asyncio.run(update_db())
except Exception as e:
    print(f"Error: {e}")
