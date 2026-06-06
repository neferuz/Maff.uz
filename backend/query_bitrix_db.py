import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # Check some rows from b_iblock_element
    cmd = """
    mysql -D sitemanager -e "SELECT ID, NAME, PREVIEW_PICTURE, DETAIL_PICTURE FROM b_iblock_element LIMIT 20;"
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Sample items from b_iblock_element:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
