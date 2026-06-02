import urllib.request
import ssl
from bs4 import BeautifulSoup

def main():
    url = "https://www.solidgroup.ru/catalog/podlozhka_pod_lvt_/podlozhka_solid_protector_thermo_spc_perforirovannaya_dlya_teplykh_vodyanykh_polov_pod_spc_wpc_lvt_1/"
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            soup = BeautifulSoup(html, "html.parser")
            
            # og:image
            og = soup.find("meta", property="og:image")
            print("og:image:", og.get("content") if og else None)
            
            for img in soup.find_all("img"):
                if "upload" in img.get("src", ""):
                    print("Img:", img["src"])
                    
    except Exception as e:
        print(f"Error fetching: {e}")

if __name__ == '__main__':
    main()
