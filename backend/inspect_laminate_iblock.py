import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    cmd = """
    mysql -D sitemanager -e "
    SELECT ID, IBLOCK_ID, NAME FROM b_iblock_element WHERE ID IN (65, 241, 454);
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Iblock IDs of laminate products in Bitrix:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
