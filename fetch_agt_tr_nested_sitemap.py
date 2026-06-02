import urllib.request
import ssl
import xml.etree.ElementTree as ET

def fetch_sitemap(url, ctx):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    xml_data = fetch_sitemap("https://www.agt.com.tr/tr/sitemap.xml", ctx)
    if not xml_data: return
    
    root = ET.fromstring(xml_data)
    urls = []
    
    for child in root:
        for elem in child:
            if 'loc' in elem.tag:
                urls.append(elem.text)
                
    print(f"Found {len(urls)} URLs in /tr/sitemap.xml")
    
    products = [u for u in urls if '/urun/' in u or 'prk' in u.lower() or 'lb' in u.lower()]
    print(f"Found {len(products)} potential product URLs.")
    
    with open("agt_tr_urls.txt", "w") as f:
        for u in urls:
            f.write(u + "\n")
            
    print("Sample PRK urls:")
    for u in [u for u in urls if 'prk' in u.lower()][:10]:
        print("  ", u)
        
    print("Sample LB urls:")
    for u in [u for u in urls if 'lb' in u.lower()][:10]:
        print("  ", u)

if __name__ == '__main__':
    main()
