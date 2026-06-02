import urllib.request
import ssl
import xml.etree.ElementTree as ET

def main():
    url = "https://agt.com.ru/sitemap.xml"
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
            
            # Parse XML
            root = ET.fromstring(xml_data)
            # Sitemap format: <url><loc>link</loc></url>
            # Namespace is usually {http://www.sitemaps.org/schemas/sitemap/0.9}
            urls = []
            for child in root:
                for elem in child:
                    if 'loc' in elem.tag:
                        urls.append(elem.text)
                        
            print(f"Found {len(urls)} URLs in sitemap.")
            
            # Save urls to file for quick searching
            with open("agt_urls.txt", "w") as f:
                for u in urls:
                    f.write(u + "\n")
                    
            # Let's print some
            prk_urls = [u for u in urls if 'prk' in u.lower()]
            lb_urls = [u for u in urls if 'lb-' in u.lower() or 'lb' in u.lower()]
            
            print(f"Found {len(prk_urls)} PRK URLs:")
            for u in prk_urls[:5]: print("  ", u)
            
            print(f"Found {len(lb_urls)} LB URLs:")
            for u in lb_urls[:5]: print("  ", u)
            
    except Exception as e:
        print(f"Error fetching sitemap: {e}")

if __name__ == '__main__':
    main()
