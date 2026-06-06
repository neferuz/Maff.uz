import asyncio
from app.services.one_c import one_c_service

async def main():
    items = await one_c_service.fetch_nomenclatura(top=5, skip=0, is_folder=None)
    for i in items:
        print(f"Name: {i.get('Description')}")
        print(f"IsFolder: {i.get('IsFolder')} (type: {type(i.get('IsFolder'))})")
        print("---")

asyncio.run(main())
