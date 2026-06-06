import requests
from bs4 import BeautifulSoup

urls = [
    "https://portika.ru/mezhkomnatnyie-dveri/fleksemal-%28flexemal%29/seriya-classico/klassiko-pta-12.2?modification=903",
    "https://portika-spb.ru/mezhkomnatnye-dveri/flexemal/klassiko-pta-12-2-shellac-white/",
    "https://169.ru/mezhkomnatnye-dveri/polipropilen/monochrome/classico/dpg-pp-klassiko-32-alaska/",
    "https://dverishop.ru/mezhkomnatnye-dveri/classico-32-alaska/",
    "https://elporta.by/catalog/mezhkomnatnye-dveri/polipropilen-monochrome/classico/klassiko-43-alaska-white-crystal"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

found = False
for url in urls:
    try:
        r = requests.get(url, headers=headers, timeout=10)
        text = r.text.lower()
        if "sonoma" in text or "сонома" in text or "grey oak" in text or "грей оак" in text:
            print(f"Found Sonoma/Grey Oak on: {url}")
            found = True
    except:
        pass

if not found:
    print("No Sonoma or Grey Oak found in these pages.")
