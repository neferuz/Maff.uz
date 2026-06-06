import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # Query iblock properties for SKU/Article
    cmd = """
    mysql -D sitemanager -e "
    SELECT ID, IBLOCK_ID, NAME, CODE 
    FROM b_iblock_property 
    WHERE CODE LIKE '%ART%' OR CODE LIKE '%SKU%' OR CODE LIKE '%KOD%' OR NAME LIKE '%Артикул%' OR NAME LIKE '%Код%';
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("SKU/Article/Code properties in Bitrix:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
