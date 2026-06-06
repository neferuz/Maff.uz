import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # Query property values for property ID 112
    cmd = """
    mysql -D sitemanager -e "
    SELECT IBLOCK_ELEMENT_ID, VALUE 
    FROM b_iblock_element_property 
    WHERE IBLOCK_PROPERTY_ID = 112 
    LIMIT 20;
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("SKU property values (property ID 112) in Bitrix:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
