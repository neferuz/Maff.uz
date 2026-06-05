import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Target Venice V3 configurations:
    # 1. White matte (Белый матовый)
    #    - ПО (glazed): /images/products/zadoor/7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg
    #    - ПГ (solid): /static/uploads/doors/classic_baguette_венеция_пг_в3_белый_матовый_пг_image_1633783169_0.jpg
    # 2. Gray matte (Серый матовый)
    #    - ПО (glazed): /static/uploads/doors/classic_baguette_венеция_пг_в3_графит_премьер_мат_пг_image_1633783169_15.jpg
    #    - ПГ (solid): /static/uploads/doors/classic_baguette_венеция_пг_в3_серый_матовый_пг_image_1633783169_7.jpg
    # 3. Graphite matte (Графит)
    #    - ПО (glazed): /static/uploads/doors/classic_baguette_венеция_пг_в3_белый_матовый_пг_image_1633783169_13.jpg
    #    - ПГ (solid): /static/uploads/doors/classic_baguette_венеция_пг_в3_графит_премьер_мат_пг_image_1633783169_6.jpg

    mappings = [
        # White
        {"name_like": "%Венеция%ПО%В3%Белы%", "image_url": "/images/products/zadoor/7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg"},
        {"name_like": "%Венеция%ПГ%В3%Белы%", "image_url": "/static/uploads/doors/classic_baguette_венеция_пг_в3_белый_матовый_пг_image_1633783169_0.jpg"},
        # Gray
        {"name_like": "%Венеция%ПО%В3%Серы%", "image_url": "/static/uploads/doors/classic_baguette_венеция_пг_в3_графит_премьер_мат_пг_image_1633783169_15.jpg"},
        {"name_like": "%Венеция%ПГ%В3%Серы%", "image_url": "/static/uploads/doors/classic_baguette_венеция_пг_в3_серый_матовый_пг_image_1633783169_7.jpg"},
        # Graphite
        {"name_like": "%Венеция%ПО%В3%Графит%", "image_url": "/static/uploads/doors/classic_baguette_венеция_пг_в3_белый_матовый_пг_image_1633783169_13.jpg"},
        {"name_like": "%Венеция%ПГ%В3%Графит%", "image_url": "/static/uploads/doors/classic_baguette_венеция_пг_в3_графит_премьер_мат_пг_image_1633783169_6.jpg"},
    ]

    async with async_session() as session:
        for m in mappings:
            print(f"Updating products matching: {m['name_like']} -> {m['image_url']}")
            # Find and print matched products first
            find_res = await session.execute(
                text("SELECT id, name, image_url FROM product WHERE name ILIKE :name_like AND is_active = True AND category_id = 452"),
                {"name_like": m["name_like"]}
            )
            matched = find_res.fetchall()
            if not matched:
                print("  No active products found.")
                continue
            
            for p in matched:
                print(f"  [MATCH] ID={p[0]} | Name='{p[1]}' | Old Image={p[2]}")
                
            # Perform update
            up_res = await session.execute(
                text("UPDATE product SET image_url = :image_url WHERE name ILIKE :name_like AND is_active = True AND category_id = 452"),
                {"image_url": m["image_url"], "name_like": m["name_like"]}
            )
            print(f"  [UPDATED] {up_res.rowcount} rows.")
            
        await session.commit()
        print("Commit completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
