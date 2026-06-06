import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    command = """sudo -u postgres psql -d maff_db -t -c "SELECT count(*) FROM product;" """
    stdin, stdout, stderr = client.exec_command(command)
    print("Total products in maff_db:", stdout.read().decode().strip())
    
    command2 = """sudo -u postgres psql -d maff_db -t -c "SELECT count(*) FROM product WHERE image_url IS NOT NULL;" """
    stdin, stdout, stderr = client.exec_command(command2)
    print("Products with image in maff_db:", stdout.read().decode().strip())
    
except Exception as e:
    print(f"Error: {e}")
