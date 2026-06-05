import os
import subprocess
import httpx

JB_URLS = {
    "jb_mirabo.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/6d6/700_700_2/z6dibut8u1v1staol2bdp44vzq0uy2pq.jpg",
    "jb_aragon.jpg": "https://laminat33.ru/wa-data/public/shop/products/12/76/7612/images/26126/26126.0x460.jpg",
    "jb_kipiani.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/2f1/700_700_2/0ukvqhwref1p7j034xj0y4wicppvl4w7.jpg",
    "jb_goyer.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/106/700_700_2/ha1ufc103agfbzq09k0nqrfkvkvk35ei.jpg",
    "jb_romanoff.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/0c6/700_700_2/03tyb1bxdwdgx297e4fyoei7sjhbj6e2.jpg",
    "jb_cassini.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/f9e/700_700_2/z6qnttle29rry2v1oyv9px4887umgc24.jpg",
    "jb_profitrole.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/1bc/700_700_2/qu27b96kkhksjje03vpuviy841tjraas.jpg",
    "jb_ravachol.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/c5c/700_700_2/i4daivxxl5v123v8ezvypn108wu9oc3a.jpg",
    "jb_milfei.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/ad4/700_700_2/w7npwn8kii5powiwalsp6x0iqknntdlz.jpg",
    "jb_chaudeau.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/5ba/700_700_2/a9xeq7ihq8v1jfjoyc33da7tnsp2zlcy.jpg",
    "jb_macaron.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/958/700_700_2/c7f6t3j7nsynxbm3iapbqbvdk6numqk1.jpg",
    "jb_galois.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/9f1/700_700_2/agwgijxdhxi0fgu5ng5p4gysduhhqcnw.jpg",
    "jb_jourman.jpg": "https://jossbeaumont.ru/upload/resize_cache/iblock/2bb/700_700_2/h7nkbjxdt4gr5d7lza0u331yv76vfxkb.jpg"
}

TARGET_DIR = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/jossbeaumont"

def optimize_image(temp_path, final_path):
    try:
        # Use macOS sips to optimize and convert/resample the image
        cmd = [
            "sips",
            "-s", "format", "jpeg",
            "-s", "formatOptions", "85",
            "--resampleHeightWidthMax", "800",
            temp_path,
            "--out", final_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode == 0:
            print(f"  Optimized {final_path} successfully (Size: {os.path.getsize(final_path)} bytes)")
            return True
        else:
            print(f"  sips error for {temp_path}: {result.stderr}")
            return False
    except Exception as e:
        print(f"  Error optimizing {temp_path}: {e}")
        return False

def main():
    os.makedirs(TARGET_DIR, exist_ok=True)
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    with httpx.Client(headers=headers, follow_redirects=True, verify=False) as client:
        for filename, url in JB_URLS.items():
            print(f"Downloading {filename} from {url}...")
            try:
                r = client.get(url, timeout=30.0)
                if r.status_code == 200:
                    temp_path = os.path.join(TARGET_DIR, f"temp_{filename}")
                    final_path = os.path.join(TARGET_DIR, filename)
                    with open(temp_path, "wb") as f:
                        f.write(r.content)
                    
                    # Optimize
                    success = optimize_image(temp_path, final_path)
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    
                    if not success:
                        # If optimization failed, just copy raw file as fallback
                        with open(final_path, "wb") as f:
                            f.write(r.content)
                        print(f"  Fallback: saved raw file {filename}")
                else:
                    print(f"  Failed download: HTTP {r.status_code}")
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    main()
