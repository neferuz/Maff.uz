import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # 1. Show tables matching iblock
    cmd = """
    mysql -D sitemanager -e "SHOW TABLES LIKE '%iblock%';"
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Iblock tables in Bitrix database:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
