import bs4
import re
import json

def main():
    with open("egger_page.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = bs4.BeautifulSoup(html, 'html.parser')
    
    # Check for script tags that contain "window.__INITIAL_STATE__" or "window.__DATA__" or similar JSON data
    scripts = soup.find_all('script')
    print(f"Total script tags: {len(scripts)}")
    
    for idx, script in enumerate(scripts):
        code = script.string or ""
        if len(code) > 100:
            print(f"Script {idx}: length={len(code)} | snippet={repr(code[:100])}")
            
    # Search for product names or keywords like "ламинат", "плинт", "Eversense"
    texts = soup.find_all(string=True)
    matches = [t.strip() for t in texts if t.strip() and any(k in t.lower() for k in ["ламинат", "плинт", "eversense", "egger", "декор", "дуб"])]
    print(f"\nMatching text items: {len(matches)}")
    for m in matches[:30]:
        print(f" - {m[:100]}")
        
    # Search for potential JSON script
    for script in scripts:
        code = script.string or ""
        if "window." in code or "JSON.parse" in code or "__state" in code or "landingData" in code:
            print("\nFound script with state variables!")
            # Let's see if we can find JSON block
            match = re.search(r'(\{.*\})', code)
            if match:
                try:
                    js_data = json.loads(match.group(1))
                    print("Successfully parsed embedded JSON!")
                    print(f"Keys: {list(js_data.keys())}")
                except Exception as e:
                    pass

if __name__ == '__main__':
    main()
