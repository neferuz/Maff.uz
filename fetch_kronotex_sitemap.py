import urllib.request
import ssl
import xml.etree.ElementTree as ET

def main():
    url = "https://www.kronotex.ru/sitemap.xml"
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
            # print first 500 chars to see if it's a sitemap index or urls
            print(xml_data[:500].decode('utf-8'))
            
            root = ET.fromstring(xml_data)
            urls = []
            for child in root:
                for elem in child:
                    if 'loc' in elem.tag:
                        urls.append(elem.text)
                        
            print(f"\nFound {len(urls)} URLs in sitemap.")
            
            with open("kronotex_urls.txt", "w") as f:
                for u in urls:
                    f.write(u + "\n")
                    
            print("Sample URLs:")
            for u in urls[:15]:
                print("  ", u)
                
    except Exception as e:
        print(f"Error fetching sitemap: {e}")

if __name__ == '__main__':
    main()
