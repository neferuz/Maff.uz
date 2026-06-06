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
    SELECT ID, NAME, PREVIEW_TEXT, DETAIL_TEXT
    FROM b_iblock_element
    WHERE NAME LIKE '%Gravity (битум плитка) 5736%' OR NAME LIKE '%Lines%';
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Element texts:")
    print(stdout.read().decode())
    
    cmd2 = """
    mysql -D sitemanager -e "
    SELECT p.NAME, ep.VALUE
    FROM b_iblock_element_property ep
    JOIN b_iblock_property p ON ep.IBLOCK_PROPERTY_ID = p.ID
    WHERE ep.IBLOCK_ELEMENT_ID = (SELECT ID FROM b_iblock_element WHERE NAME LIKE '%Gravity (битум плитка) 5736%' LIMIT 1);
    "
    """
    stdin2, stdout2, stderr2 = client.exec_command(cmd2)
    print("Gravity Properties:")
    print(stdout2.read().decode())
    
except Exception as e:
    print(f"Error: {e}")
