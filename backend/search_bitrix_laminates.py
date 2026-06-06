import paramiko

host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    
    print("SSH connection successful!")
    
    # Query join table for elements, their SKU (prop 112) and their images from b_file
    cmd = """
    mysql -D sitemanager -e "
    SELECT 
        el.ID, 
        el.NAME, 
        prop.VALUE as SKU,
        CONCAT('/upload/', f.SUBDIR, '/', f.FILE_NAME) as IMAGE_PATH
    FROM b_iblock_element el
    JOIN b_iblock_element_property prop ON el.ID = prop.IBLOCK_ELEMENT_ID AND prop.IBLOCK_PROPERTY_ID = 112
    LEFT JOIN b_file f ON el.DETAIL_PICTURE = f.ID OR el.PREVIEW_PICTURE = f.ID
    WHERE el.NAME LIKE '%Paloma%' OR el.NAME LIKE '%Movie%' OR el.NAME LIKE '%Akaba%' OR el.NAME LIKE '%Egger%' OR prop.VALUE IN ('80194', '4582', '4525', '4590', '80184')
    LIMIT 30;
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Matched laminates in Bitrix database:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
