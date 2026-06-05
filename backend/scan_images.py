import os
import time

def scan_dir(path):
    print(f"Scanning: {path}")
    if not os.path.exists(path):
        print("Path does not exist")
        return
    for root, dirs, files in os.walk(path):
        for f in files:
            full_path = os.path.join(root, f)
            mtime = os.path.getmtime(full_path)
            # if modified within last 2 days
            if time.time() - mtime < 2 * 24 * 3600 or "ruch" in f.lower() or "handle" in f.lower() or "system" in f.lower():
                print(f"File: {os.path.relpath(full_path, path)} | Size: {os.path.getsize(full_path)} | Modified: {time.ctime(mtime)}")

scan_dir("/Users/apple/Desktop/Maff.uz-main/frontend/public")
