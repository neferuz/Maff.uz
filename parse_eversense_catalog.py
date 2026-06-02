import bs4
import json

def main():
    filepath = "/Users/apple/.gemini/antigravity-ide/brain/d2dde1db-e0b5-4a54-9c42-163c078c9c24/.system_generated/steps/3562/content.md"
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()
        
    soup = bs4.BeautifulSoup(html, 'html.parser')
    
    # OpenCart products are usually in elements with class like "product-layout" or "product-grid" or inside divs in the main catalog
    # Let's search for divs with class "image" or "name" or search for all links with images inside catalog
    products = []
    
    # OpenCart theme 317 usually stores product blocks in .product-grid or .row-fluid
    product_divs = soup.find_all(class_=lambda c: c and ('product' in c or 'image' in c or 'name' in c))
    print(f"Total product-related divs: {len(product_divs)}")
    
    # Let's search for all product links on this catalog page
    # Products usually have structure: <div class="image"><a href="product_url"><img src="image_url"/></a></div>
    # <div class="name"><a href="product_url">Product Name</a></div>
    
    seen_links = set()
    
    # We find all a tags that contain images in this page
    for a in soup.find_all('a'):
        href = a.get('href')
        if href and ('/product/' in href or 'eggerspb.ru/' in href):
            img = a.find('img')
            if img:
                src = img.get('src')
                # Try to get the name from sibling or parent or title
                name = img.get('title') or img.get('alt') or ""
                
                # Let's find name in siblings or parent
                parent = a.parent
                sibling_name = ""
                for sib in parent.find_all(class_='name'):
                    sibling_name = sib.get_text().strip()
                if not sibling_name:
                    # search sibling tags
                    for s in parent.next_siblings:
                        if isinstance(s, bs4.element.Tag):
                            if 'name' in s.get('class', []):
                                sibling_name = s.get_text().strip()
                                break
                                
                final_name = sibling_name or name or a.get_text().strip()
                if src and href not in seen_links:
                    seen_links.add(href)
                    products.append({
                        "name": final_name,
                        "link": href,
                        "image": src
                    })
                    
    print(f"Extracted {len(products)} products from OpenCart catalog page:")
    for idx, p in enumerate(products):
        print(f"{idx+1}. Name: {repr(p['name'])}")
        print(f"   Link: {p['link']}")
        print(f"   Image: {p['image']}")
        print("-" * 60)

if __name__ == '__main__':
    main()
