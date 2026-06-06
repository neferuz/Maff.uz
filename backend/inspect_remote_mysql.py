import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # 1. Show databases in MySQL
    print("\n=== MySQL Databases ===")
    stdin, stdout, stderr = client.exec_command("mysql -e 'SHOW DATABASES;'")
    print(stdout.read().decode())
    
    # 2. Show directory of /home/bitrix to find project files
    print("\n=== Listing /home/bitrix ===")
    stdin, stdout, stderr = client.exec_command("ls -la /home/bitrix")
    print(stdout.read().decode())
    
    # 3. Check for any bitrix upload directory
    print("\n=== Finding bitrix upload folders ===")
    stdin, stdout, stderr = client.exec_command("find /home/bitrix /var/www -name 'upload' -type d 2>/dev/null")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
