import os

base_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads"
matches = []

if os.path.exists(base_dir):
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if "silkwood" in f.lower() or "silkvud" in f.lower() or "силквуд" in f.lower():
                matches.append(os.path.join(root, f))

print("Found Silkwood images on disk:", matches)
