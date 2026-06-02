import asyncio
import os
import sys

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== RECURSIVE SEARCH FOR SILK/WOOD FILES ON SERVER ===")
    
    upload_dir = "/home/bitrix/www/upload/"
    if not os.path.exists(upload_dir):
        print(f"Directory {upload_dir} does not exist on this machine!")
        return

    keywords = ['silk', 'wood', 'силк', 'вуд', 'силка', 'силко']
    print(f"Scanning {upload_dir} for keywords: {keywords}...")
    
    matched_files = []
    
    for root, dirs, files in os.walk(upload_dir):
        for file in files:
            file_lower = file.lower()
            for kw in keywords:
                if kw in file_lower:
                    full_path = os.path.join(root, file)
                    matched_files.append(full_path)
                    break

    print(f"\nFound {len(matched_files)} files matching keywords:")
    for path in matched_files[:150]:
        rel_path = path.replace("/home/bitrix/www/", "")
        print(f"  /{rel_path} (Size: {os.path.getsize(path)} bytes)")

if __name__ == "__main__":
    asyncio.run(main())
