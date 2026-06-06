import paramiko

host = '192.168.183.35'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username='root', password='rJhj,rf2@', timeout=5)

# Check all laminate products on remote - specifically the ones without photos locally
command = """sudo -u postgres psql -d maff_db -t -c "
SELECT p.id, p.name, p.image_url, c.name as cat_name 
FROM product p 
JOIN category c ON p.category_id = c.id
WHERE p.category_id IN (80, 94, 101, 107, 109, 316, 397, 56, 68, 414, 1)
AND p.is_active = True
ORDER BY c.name, p.name;
" """

stdin, stdout, stderr = client.exec_command(command)
output = stdout.read().decode()

lines = [l.strip() for l in output.split('\n') if l.strip()]
with_photo = 0
no_photo = 0
print("=== REMOTE SERVER laminate products ===")
for line in lines:
    parts = [p.strip() for p in line.split('|')]
    if len(parts) >= 4:
        pid, name, img, cat = parts[0], parts[1], parts[2], parts[3]
        if img and img != '':
            with_photo += 1
        else:
            no_photo += 1
            print(f"  NO PHOTO: ID={pid} | {cat} | {name}")

print(f"\nTotal WITH photo: {with_photo}")
print(f"Total WITHOUT photo: {no_photo}")

# Also show those that DO have photos
print("\n=== Products WITH photos on remote ===")
for line in lines:
    parts = [p.strip() for p in line.split('|')]
    if len(parts) >= 4:
        pid, name, img, cat = parts[0], parts[1], parts[2], parts[3]
        if img and img != '':
            print(f"  ID={pid} | {cat} | {img[:60]} | {name}")

