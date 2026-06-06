import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/new-maff-website/backend/static/uploads')
    print(stdout.read().decode())
    
    stdin, stdout, stderr = client.exec_command('ls -la /var/www/new-maff-website/frontend/public/images/products')
    print(stdout.read().decode())
    
except Exception as e:
    print(f"Error: {e}")
