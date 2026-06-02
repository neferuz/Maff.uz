import sys
import os
import subprocess

CONFIG_PATH = "/etc/nginx/bx/site_enabled/maff_new.conf"
BACKUP_PATH = CONFIG_PATH + ".bak2"

def main():
    if not os.path.exists(CONFIG_PATH):
        print(f"Error: Nginx config file not found at {CONFIG_PATH}")
        sys.exit(1)
        
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Make backup
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Backup created successfully.")
    
    # Check if already added
    if "location = /generation" in content:
        print("Webhook Nginx configuration already present.")
        sys.exit(0)
        
    # Target replacement: insert before "location / {"
    target = "    location / {"
    
    replacement = """    location = /generation {
        if ($request_method = POST) {
            rewrite ^/generation$ /api/generation/webhook last;
        }
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {"""
    
    if target not in content:
        print("Error: Target 'location / {' not found in Nginx configuration.")
        sys.exit(1)
        
    new_content = content.replace(target, replacement)
    
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print("New Nginx configuration written.")
    
    # Test Nginx syntax
    test_res = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
    if test_res.returncode != 0:
        print("Error: Nginx configuration test failed! Restoring backup...")
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        print(test_res.stderr)
        sys.exit(1)
        
    print("Nginx syntax test passed.")
    
    # Reload Nginx
    reload_res = subprocess.run(["systemctl", "reload", "nginx"], capture_output=True, text=True)
    if reload_res.returncode != 0:
        print("Error: Failed to reload Nginx! Restoring backup...")
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        subprocess.run(["systemctl", "reload", "nginx"])
        print(reload_res.stderr)
        sys.exit(1)
        
    print("Nginx reloaded successfully!")

if __name__ == "__main__":
    main()
