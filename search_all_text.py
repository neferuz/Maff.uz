import bs4

def main():
    with open("egger_page.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = bs4.BeautifulSoup(html, 'html.parser')
    
    # Remove scripts and styles
    for script in soup(["script", "style"]):
        script.extract()
        
    # Get clean text
    text = soup.get_text(separator='\n')
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    print(f"Total lines of visible text: {len(lines)}")
    print("-" * 60)
    for idx, line in enumerate(lines[:100]):
        print(f"{idx}: {line}")
    print("-" * 60)

if __name__ == '__main__':
    main()
