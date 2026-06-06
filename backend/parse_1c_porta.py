import re
from bs4 import BeautifulSoup

def main():
    file_path = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/Цены 1C.html"
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    products = []
    # Find all rows in the table
    rows = soup.find_all("tr")
    for row in rows:
        cols = row.find_all("td")
        if len(cols) >= 2:
            name_cell = cols[0].get_text(strip=True)
            price_cell = cols[1].get_text(strip=True).replace("\xa0", "").replace(" ", "").replace(",", ".")
            
            if "Порта" in name_cell and "ПТА" not in name_cell and "Коробка" not in name_cell and "Наличник" not in name_cell and "Добор" not in name_cell and "Плинтус" not in name_cell:
                try:
                    price = float(price_cell) if price_cell else 0.0
                    products.append((name_cell, price))
                except ValueError:
                    continue
    
    print(f"Found {len(products)} 'Порта' products in 1C:")
    for name, price in products:
        print(f"  {name} : {price}")

main()
