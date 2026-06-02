import urllib.request
import ssl

def main():
    url = "https://www.egger.com/sitemap.xml"
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
            print("sitemap:", xml_data[:500].decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
