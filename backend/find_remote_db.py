import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    # Check .env in new-maff-website
    stdin, stdout, stderr = client.exec_command('cat /var/www/new-maff-website/backend/.env')
    print("Backend .env:")
    print(stdout.read().decode())
    
except Exception as e:
    print(f"Error: {e}")
