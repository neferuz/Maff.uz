import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    command = """sudo -u postgres psql -d maff_db -t -c "SELECT id, image_url FROM product WHERE image_url IS NOT NULL LIMIT 5;" """
    stdin, stdout, stderr = client.exec_command(command)
    output = stdout.read().decode()
    print("OUTPUT:")
    print(repr(output))
    
except Exception as e:
    print(f"Error: {e}")
