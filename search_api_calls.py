import re

def main():
    with open("egger_page.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    # Search for all strings matching /api/ or similar API patterns
    api_patterns = re.findall(r'\"(/[^\"]*api[^\"]*)\"', html)
    print(f"Potential API paths: {len(api_patterns)}")
    for p in set(api_patterns):
        print(f"  {p}")
        
    # Search for domain names or links containing yandex.net or yandex.ru or clients.site
    domains = re.findall(r'https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', html)
    print(f"\nDomains found: {len(domains)}")
    for d in set(domains):
        print(f"  {d}")

if __name__ == '__main__':
    main()
