import os
import glob

def find_images():
    path = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/"
    if not os.path.exists(path):
        print(f"Path does not exist: {path}")
        return
            
    print(f"Scanning images in: {path}")
    pattern1 = os.path.join(path, "*venet*")
    pattern2 = os.path.join(path, "*baguette*")
    pattern3 = os.path.join(path, "*венец*")
    
    files = glob.glob(pattern1) + glob.glob(pattern2) + glob.glob(pattern3)
    files = list(set(files)) # unique paths
    
    print(f"Found {len(files)} files:")
    for f in sorted(files):
        print(f"  - {os.path.basename(f)} | Size: {os.path.getsize(f)}")

if __name__ == "__main__":
    find_images()
