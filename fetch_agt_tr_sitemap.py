import urllib.request
import ssl
import xml.etree.ElementTree as ET

def main():
    url = "https://www.agt.com.tr/sitemap.xml"
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
            # The root might be a sitemapindex
            root = ET.fromstring(xml_data)
            
            sitemaps = []
            for child in root:
                for elem in child:
                    if 'loc' in elem.tag:
                        sitemaps.append(elem.text)
                        
            print(f"Found {len(sitemaps)} items in main sitemap:")
            for s in sitemaps[:10]:
                print(s)
                
    except Exception as e:
        print(f"Error fetching sitemap: {e}")

if __name__ == '__main__':
    main()
