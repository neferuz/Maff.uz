import os
import glob
import time

def check_mtimes():
    path = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/"
    files = glob.glob(os.path.join(path, "*венеция*")) + glob.glob(os.path.join(path, "*venet*"))
    files = list(set(files))
    
    print("File modification times:")
    for f in sorted(files):
        mtime = os.path.getmtime(f)
        print(f"  - {os.path.basename(f)} | Size: {os.path.getsize(f)} | Modified: {time.ctime(mtime)}")

if __name__ == "__main__":
    check_mtimes()
