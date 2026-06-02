import re
import json

def main():
    filepath = "egger_page.html"
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
        
    # Reconstruct Next.js App Router stream
    # Next.js puts chunks inside self.__next_f.push([1, "chunk_data"]) or self.__next_f.push([0, ...])
    # Let's extract all the string literals in these push calls
    
    pattern = r'self\.__next_f\.push\(\[1,\s*\"(.*?)\"\s*\]\)'
    matches = re.findall(pattern, html)
    print(f"Regex matches: {len(matches)}")
    
    # Let's do a more robust search using simple string split to capture everything
    chunks = []
    start_str = 'self.__next_f.push([1,"'
    end_str = '"])'
    
    pos = 0
    while True:
        idx = html.find(start_str, pos)
        if idx == -1:
            break
        end_idx = html.find(end_str, idx + len(start_str))
        if end_idx == -1:
            break
        chunk = html[idx + len(start_str) : end_idx]
        chunks.append(chunk)
        pos = end_idx + len(end_str)
        
    print(f"Robust method extracted chunks: {len(chunks)}")
    
    full_text = ""
    for i, c in enumerate(chunks):
        # Unescape quotes and slashes
        decoded = c.replace('\\"', '"').replace('\\\\', '\\').replace('\\/', '/')
        full_text += decoded
        if i < 5:
            print(f"Chunk {i+1} length: {len(decoded)} | start: {repr(decoded[:100])}")
            
    print(f"\nTotal merged RSC size: {len(full_text)}")
    
    # Save the full merged text
    with open("obninsk_full_rsc.txt", "w", encoding="utf-8") as f_out:
        f_out.write(full_text)
        
    # Search for product keywords
    keywords = ["ламинат", "плинт", "eversense", "egger", "дуб", "EL", "aqua"]
    for kw in keywords:
        matches = [m.start() for m in re.finditer(kw, full_text, re.IGNORECASE)]
        print(f"Keyword '{kw}' matches: {len(matches)}")
        
    # Search for any avatars.mds.yandex.net URLs
    yandex_urls = re.findall(r'https?://avatars\.mds\.yandex\.net/[^\s\",\\`\'<]*', full_text)
    print(f"Yandex avatar URLs in full RSC: {len(yandex_urls)}")
    for u in set(yandex_urls[:20]):
        print(f"  {u}")

if __name__ == '__main__':
    main()
