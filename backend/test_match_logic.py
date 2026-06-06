import asyncio
import paramiko
import re

ssh_host = '192.168.183.35'
ssh_user = 'root'
ssh_pass = 'rJhj,rf2@'

async def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ssh_host, username=ssh_user, password=ssh_pass, timeout=15)
    
    # Let's search Bitrix for a few specific examples
    query = """
    mysql -D sitemanager -B -N -e "
    SELECT ID, NAME, PREVIEW_PICTURE, DETAIL_PICTURE FROM b_iblock_element WHERE NAME LIKE '%EL2173%' OR NAME LIKE '%EPL146%' OR NAME LIKE '%4582%';
    "
    """
    stdin, stdout, stderr = client.exec_command(query)
    print("Direct matches in Bitrix for specific names:")
    print(stdout.read().decode())
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
