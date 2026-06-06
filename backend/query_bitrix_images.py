import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # Run the join query
    cmd = """
    mysql -D sitemanager -e "
    SELECT 
        el.ID, 
        el.NAME, 
        f.SUBDIR, 
        f.FILE_NAME 
    FROM b_iblock_element el
    JOIN b_file f ON el.DETAIL_PICTURE = f.ID OR el.PREVIEW_PICTURE = f.ID
    LIMIT 40;
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Sample items with file paths from Bitrix:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
