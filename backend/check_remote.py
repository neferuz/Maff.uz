import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    # Let's check where the project is
    stdin, stdout, stderr = client.exec_command('ls -la /var/www /root /home')
    print(stdout.read().decode())
    
    stdin, stdout, stderr = client.exec_command('find / -maxdepth 3 -type d -name "Maff.uz*"')
    print(stdout.read().decode())

except Exception as e:
    print(f"Error connecting to {host}: {e}")
    # try public IP
    host = '213.230.66.182'
    try:
        print(f"Trying public IP {host}...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
        
        stdin, stdout, stderr = client.exec_command('ls -la /var/www /root /home')
        print(stdout.read().decode())
        
        stdin, stdout, stderr = client.exec_command('find / -maxdepth 3 -type d -name "Maff*"')
        print(stdout.read().decode())
    except Exception as e2:
        print(f"Error connecting to {host}: {e2}")

