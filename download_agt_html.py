import urllib.request
import ssl

def main():
    url = "https://agt.com.ru/laminat-agt-kolelkcziya-natura-line"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            with open("agt_natura_line.html", "w", encoding="utf-8") as f:
                f.write(html)
            print(f"Saved {len(html)} bytes to agt_natura_line.html")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
