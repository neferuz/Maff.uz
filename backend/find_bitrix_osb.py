import paramiko
host = '192.168.183.35'
username = 'root'
password = 'rJhj,rf2@'
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, username=username, password=password, timeout=10)
    stdin, stdout, stderr = client.exec_command("find / -name g19dtsi1p7a31m1k5n8skl1p3kgfz6nk.jpg 2>/dev/null")
    print(stdout.read().decode())
except Exception as e:
    print(e)
