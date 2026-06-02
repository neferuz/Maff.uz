import os
import re

base_dir = "/Users/apple/Desktop/Maff.uz-main/admin-panel/src/app"

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            original_content = content
            
            # Check if "use client"; is in the file
            if '"use client"' in content or "'use client'" in content:
                # Remove all occurrences of "use client";
                content = re.sub(r'["\']use client["\'];?\s*', '', content)
                # Add "use client"; at the absolute top
                content = '"use client";\n' + content
                
            if content != original_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed use client in: {filepath}")
