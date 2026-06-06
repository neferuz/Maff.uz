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
    SELECT 
        el.ID, 
        el.NAME, 
        prop.VALUE as SKU,
        CONCAT('/upload/', f.SUBDIR, '/', f.FILE_NAME) as IMAGE_PATH
    FROM b_iblock_element el
    LEFT JOIN b_iblock_element_property prop ON el.ID = prop.IBLOCK_ELEMENT_ID AND prop.IBLOCK_PROPERTY_ID = 112
    LEFT JOIN b_file f ON el.DETAIL_PICTURE = f.ID OR el.PREVIEW_PICTURE = f.ID
    WHERE el.IBLOCK_ID = 2
    AND (el.NAME LIKE '%Плинтус%' OR el.NAME LIKE '%INDO%' OR el.NAME LIKE '%INTEGRA%' OR el.NAME LIKE '%VEGA%' OR el.NAME LIKE '%VIGO%' OR el.NAME LIKE '%Arbiton%')
    LIMIT 30;
    "
    """
    stdin, stdout, stderr = client.exec_command(cmd)
    print("Plinths in Bitrix database:")
    print(stdout.read().decode())

except Exception as e:
    print(f"Error: {e}")
