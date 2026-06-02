import asyncio
from app.services.one_c import one_c_service

async def main():
    print("Fetching nomenclature from 1C...")
    skip = 0
    batch_size = 1000
    all_items = []
    while True:
        items = await one_c_service.fetch_nomenclatura(top=batch_size, skip=skip, is_folder=False)
        if not items:
            break
        all_items.extend(items)
        skip += batch_size
        if len(items) < batch_size:
            break
            
    print(f"Total 1C items: {len(all_items)}")
    
    search_groups = {
        "Swiss Krono": ['ECO-TEC', 'GROTESK', 'COMPLIMENT', 'HOMESTANDART', 'BIOM', 'MAGISTER', 'ARTO', 'CASPIAN', 'ECOLOGIK', 'FANAT', 'SYNCHROPOLIS'],
        "Joss Beaumont": ['LIBERTE', 'OPUS', 'VERITAS'],
        "Kronopol": ['SIGMA', 'TERRA', 'PALOMA', 'MOVIE', 'MARINE', 'BLACKPOOL', 'FIORI', 'SOUND', 'DOLCE', 'AKABA', 'ENIGMA', 'TESTA', 'ZODIAK', 'AURUM', 'PLATINIUM'],
        "Kronotex / Krono": ['AMAZONE', 'MAMMUT', 'ROBUSTO', 'CATWALK', 'ADVANCED', 'MY CASTLE', 'EXQUIUSITE', 'EXQUISITE', 'ХЕРРИНГБОН', 'МАММУТ', 'РОБУСТО', 'КЭТУОЛК', 'РАБУСТО', 'ЭКСКЮСИТ'],
        "Egger / Egger Pro / Comfort": ['COMFORT', 'EPL', 'EBL', 'EHL', 'EGER', 'EGGER'],
        "UltraDecor / Euro Home / Kronospan": ['BINYL', 'EURO HOME', 'LIGHT', 'LOFT', 'MAJESTIC', 'ART', 'HERRINGBONE', 'FLOORDREAMS', 'VARIOSTEP', 'ULTRAFLOOR', 'WHITE BOX', 'ULTRABLACK', 'FORTE VARIO', 'CASTELLO', 'VINTAGE CLASSIC', 'ULTRADECOR'],
        "Tarkett / S.Classic / Salsa": ['S.CLASSIC', 'SALSA', 'TARKETT', 'SILKWOOD'],
        "SPC": ['SPC', 'ROCKO', 'BOSCO', 'STONES', 'METAL', 'KRONOFLOOR'],
        "Porogi": ['ПОРОГ', 'КАНТ ', 'СТЫК ', 'УГОЛ ', 'КРЕПЕЖ АЛ'],
        "Hardware": ['РУЧК', 'ПЕТЛ', 'ЗАМОК', 'ЗАВЕРТКА', 'СТОППЕР', 'ОГРАНИЧИТЕЛ', 'PIXAR', 'AXEL', 'AGATE', 'MIMAS', 'METIS', 'CONCORDIA', 'SARP', 'MARVEL', 'AKIK', 'DESPINA', 'ODIN', 'ZETTA', 'GAMMA', 'VEGA', 'SINUS', 'ROCCA', 'PRIZMA', 'RODIN', 'ROCKET', 'SPINAL', 'MAJA', 'CARME', 'LINEAR', 'STARK', 'JASPER', 'VISION', 'LIBRA']
    }
    
    for group_name, keywords in search_groups.items():
        print(f"\n=== GROUP: {group_name} ===")
        for kw in keywords:
            matches = []
            for item in all_items:
                name = (item.get("НаименованиеПолное") or item.get("Description") or "").upper()
                desc = (item.get("Описание") or "").upper()
                sku = (item.get("Артикул") or "").upper()
                if kw in name or kw in desc or kw in sku:
                    matches.append(item)
            if len(matches) > 0:
                print(f"Keyword '{kw}': {len(matches)} matches in 1C")
                for m in matches[:3]:
                    print(f"  - Name: {m.get('НаименованиеПолное') or m.get('Description')} | SKU: {m.get('Артикул')} | Parent_Key: {m.get('Parent_Key')}")
            else:
                pass

if __name__ == "__main__":
    asyncio.run(main())
