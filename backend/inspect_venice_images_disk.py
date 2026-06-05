import os
import glob

def find_images():
    path = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/"
    if not os.path.exists(path):
        print(f"Path does not exist: {path}")
        # Try frontend public
        path = "/Users/apple/Desktop/Maff.uz-main/frontend/public/static/uploads/doors/"
        if not os.path.exists(path):
            print(f"Frontend path also does not exist: {path}")
            return
            
    print(f"Scanning images in: {path}")
    pattern = os.path.join(path, "*венеция*")
    files = glob.glob(pattern)
    print(f"Found {len(files)} files:")
    for f in sorted(files):
        print(f"  - {os.path.basename(f)} | Size: {os.path.getsize(f)}")

if __name__ == "__main__":
    find_images()
