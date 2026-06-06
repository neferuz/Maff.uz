import paramiko
import sys

host = '192.168.183.35'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username='root', password='rJhj,rf2@', timeout=5)
    
    # Let's search for "laminat" or "egger" folders
    stdin, stdout, stderr = client.exec_command('find /var/www /root /home -type d -iname "*laminat*" -o -iname "*egger*" -o -iname "*kronopol*" -o -iname "*agt*"')
    print("Folders found:")
    print(stdout.read().decode())
    
    # Also find recently modified folders (last 2 days)
    stdin, stdout, stderr = client.exec_command('find /root /home /var/www -type d -mtime -2')
    print("Recent folders (last 2 days):")
    print(stdout.read().decode())
    
except Exception as e:
    print(f"Error: {e}")
