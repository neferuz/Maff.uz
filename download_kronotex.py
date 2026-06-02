import urllib.request
import ssl

def main():
    url = "https://www.kronotex.ru/Kollektsii/MAMMUT/Everest-Oak-Bronze-D-3077-0001041025.html"
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
            with open("kronotex_product.html", "w") as f:
                f.write(html)
            print(f"Saved {len(html)} bytes")
    except Exception as e:
        print(f"Error fetching: {e}")

if __name__ == '__main__':
    main()
