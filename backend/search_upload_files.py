import asyncio
import os
import sys
import fnmatch

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== SEARCHING UPLOAD FILES ON SERVER FOR SILKWOOD PATTERNS ===")
    
    upload_dir = "/home/bitrix/www/upload/"
    if not os.path.exists(upload_dir):
        print(f"Directory {upload_dir} does not exist on this machine!")
        return

    codes = ['1029', '001', '506', 'H1', 'R505', 'R509']
    
    print(f"Scanning {upload_dir} for files matching codes: {codes}...")
    matched_files = []
    
    for root, dirs, files in os.walk(upload_dir):
        for file in files:
            # Check if any code is in the filename
            for code in codes:
                if code in file:
                    full_path = os.path.join(root, file)
                    matched_files.append((code, full_path))
                    break

    print(f"\nFound {len(matched_files)} matching files:")
    for code, path in matched_files[:100]:
        # Get relative path starting from 'upload'
        rel_path = path.replace("/home/bitrix/www/", "")
        print(f"  [{code}]: /{rel_path} (Size: {os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    asyncio.run(main())
