import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    # Check if there is a postgres DB and if it has images for laminates
    command = """
    docker exec postgres-db psql -U maff -d maff -c "SELECT id, name, image_url FROM product WHERE category_id = 1 OR category_id IN (SELECT id FROM category WHERE parent_id = 1) AND image_url IS NOT NULL LIMIT 10;"
    """
    stdin, stdout, stderr = client.exec_command(command)
    res = stdout.read().decode()
    if res:
        print("From docker postgres-db:")
        print(res)
    else:
        print("Trying local postgres:")
        command2 = "sudo -u postgres psql -d maff -c \"SELECT id, name, image_url FROM product WHERE category_id = 1 OR category_id IN (SELECT id FROM category WHERE parent_id = 1) AND image_url IS NOT NULL AND image_url != '/products/laminate-1.png' LIMIT 20;\""
        stdin, stdout, stderr = client.exec_command(command2)
        print(stdout.read().decode())
        print("Stderr:", stderr.read().decode())
        
except Exception as e:
    print(f"Error: {e}")
