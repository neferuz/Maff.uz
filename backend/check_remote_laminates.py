import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    command = """sudo -u postgres psql -d maff_db -t -c "SELECT id, name, image_url FROM product WHERE (category_id = 1 OR category_id IN (SELECT id FROM category WHERE parent_id = 1)) AND image_url IS NOT NULL AND image_url != '/products/laminate-1.png';" """
    stdin, stdout, stderr = client.exec_command(command)
    print("Laminates with images on remote DB:")
    print(stdout.read().decode())
    
except Exception as e:
    print(f"Error: {e}")
