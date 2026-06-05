import os
import hashlib
import glob

def md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def scan():
    path = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/"
    files = glob.glob(os.path.join(path, "*венеция*"))
    
    hashes = {}
    for f in sorted(files):
        h = md5(f)
        hashes.setdefault(h, []).append(os.path.basename(f))
        
    print(" Venice image files grouped by hash:")
    for h, names in hashes.items():
        print(f"MD5: {h}")
        for name in names:
            print(f"  - {name} (size: {os.path.getsize(os.path.join(path, name))})")

if __name__ == "__main__":
    scan()
