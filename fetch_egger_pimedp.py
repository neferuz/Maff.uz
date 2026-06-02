import urllib.request
import ssl
import xml.etree.ElementTree as ET

def main():
    url = "https://www.egger.com/sitemap/s/pimedp-0.xml"
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            xml_data = response.read()
            
            root = ET.fromstring(xml_data)
            urls = []
            for child in root:
                for elem in child:
                    if 'loc' in elem.tag:
                        urls.append(elem.text)
            
            print(f"Found {len(urls)} decor URLs.")
            for u in urls[:10]: print("  ", u)
            
            with open("egger_urls.txt", "w") as f:
                for u in urls:
                    f.write(u + "\n")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
