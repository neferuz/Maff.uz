import paramiko
import sys

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # 1. Check docker containers
    print("\n=== Running Docker Containers ===")
    stdin, stdout, stderr = client.exec_command("docker ps -a")
    print(stdout.read().decode())
    
    # 2. Check system database services (PostgreSQL, MySQL, MariaDB)
    print("\n=== Systemd Database Services ===")
    stdin, stdout, stderr = client.exec_command("systemctl list-units --type=service | grep -E 'postgres|mysql|mariadb'")
    print(stdout.read().decode())
    
    # 3. Check running processes matching sql, postgres or mysql
    print("\n=== Process List Matching SQL/Postgres/MySQL ===")
    stdin, stdout, stderr = client.exec_command("ps aux | grep -E 'postgres|mysql|mariadb' | grep -v grep")
    print(stdout.read().decode())
    
    # 4. Check folder /home or other places where web projects/databases might reside
    print("\n=== Directory listing of potential web directories ===")
    stdin, stdout, stderr = client.exec_command("ls -la /var/www /home /root")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
