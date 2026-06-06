import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Mapping of product ID to image URL
id_image_mapping = {
    4325: "https://panelowy.pl/userdata/public/gfx/22160/dab-umberto-paloma-swiss-krono.jpg",  # Paloma Aqua block 8mm 80194
    84: "https://panelowy.pl/userdata/public/gfx/22160/dab-umberto-paloma-swiss-krono.jpg",    # Paloma 8mm 80194
    4303: "https://panelowy.pl/userdata/public/gfx/18145/Dab-Oskar-2.jpg",                     # Movie Aqua Zero 8mm 4582
    106: "https://mojepodlogi.com/30915-small_default/xswiss-krono-akaba-aqua-dab-dalia-d4525-ac4-8mm.jpg.pagespeed.ic.c5DVAOGhRq.webp", # Akaba 8mm 4525
    4147: "https://panelowy.pl/userdata/public/gfx/18115/Dab-Iris-2.jpg",                      # Fiori Aqua Zero 10mm 4590
    4324: "https://panelowy.pl/userdata/public/gfx/22159/dab-mario-paloma-swiss-krono-2.jpg",  # Paloma Aqua block 8mm 80184
    83: "https://panelowy.pl/userdata/public/gfx/22159/dab-mario-paloma-swiss-krono-2.jpg",    # Paloma 8mm 80184
    4146: "https://panelowy.pl/userdata/public/gfx/18112/Dab-Dalia-2.jpg",                     # Fiori Aqua Zero 10mm 4589
    114: "https://panelowy.pl/userdata/public/gfx/18210/Dab-Capricorn-2.jpg",                  # Platinium Zodiak 10mm 4567
    116: "https://panelowy.pl/userdata/public/gfx/18212/Dab-Scorpio-2.jpg",                    # Platinium Zodiak 10mm 4569
    113: "https://panelowy.pl/userdata/public/gfx/23559/Dab-Natan-Testa-Swiss-Krono.jpg",      # Platinium Testa 8mm 4904
    108: "https://panelowy.pl/userdata/public/gfx/23552/Dab-Charlotte-Enigma-Swiss-Krono.jpg",  # Enigma 8mm 3941
    88: "https://panelowy.pl/userdata/public/gfx/d2371652dad99e1cbc52c2ed1065b943.jpg",         # Marine 10mm 3280
    89: "https://panelowy.pl/userdata/public/gfx/dd0db5850916de8f273d8cb365a7b25b.jpg",         # Marine 10mm 3787
    102: "https://panelowy.pl/userdata/public/gfx/23547/Dab-Debora-Akaba-Swiss-Krono.jpg",     # Platinium Akaba 8mm 3486
    104: "https://panelowy.pl/userdata/public/gfx/23550/Dab-Tabita-Akaba-Swiss-Krono.jpg",     # Platinium Akaba Aqua Block 8mm 3947
    110: "https://panelowy.pl/userdata/public/gfx/23557/Wiaz-Ariel-Testa-Swiss-Krono.jpg",     # Platinium Testa 8mm 3310
    111: "https://panelowy.pl/userdata/public/gfx/23558/Wiaz-Baruch-Testa-Swiss-Krono.jpg",     # Platinium Testa 8mm 3710
    4468: "https://www.eurofloors.pl/wp-content/uploads/2019/08/opera.jpg",                    # Sound 12мм 3884
    4593: "https://panelux.pl/environment/cache/images/productGfx_33670_500_500/3.jpg",        # Terra 8мм 4920
    107: "https://a.assecobs.com/_img/sklepkronodom/v1/184bc1aa-84e5-47b5-80e2-7789493984f3/panele-podlogowe-swiss-krono-platinium-enigma-dab-cora-3340-aqua-block-gr-8mm-ac4-4v-1opk-7szt-2-337-m2-.jpg",  # Enigma 8мм 3340
    109: "https://mojepodlogi.com/30975-large_default/swiss-krono-enigma-dab-rose-d4531-ac4-8mm.jpg"  # Enigma 8мм 4531
}

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Updating laminate product image URLs in database...")
        for p_id, url in id_image_mapping.items():
            query = "UPDATE product SET image_url = :url WHERE id = :id"
            result = await conn.execute(text(query), {"url": url, "id": p_id})
            print(f"Product ID: {p_id} -> Updated {result.rowcount} row(s)")

if __name__ == "__main__":
    asyncio.run(main())
