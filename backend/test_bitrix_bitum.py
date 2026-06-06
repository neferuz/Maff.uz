import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    cmd = """
    mysql -D sitemanager -e "
    SELECT e.ID, e.NAME, f.SUBDIR, f.FILE_NAME
    FROM b_iblock_element e
    LEFT JOIN b_file f ON e.DETAIL_PICTURE = f.ID OR e.PREVIEW_PICTURE = f.ID
    WHERE e.NAME LIKE '%битум%';
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode())
except Exception as e:
    print(f"Error: {e}")
