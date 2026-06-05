import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.api.v1.endpoints.products import read_products
from unittest.mock import Mock

async def test_endpoint():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Mock FastAPI request
    mock_request = Mock()
    mock_request.headers = {}
    mock_request.query_params = {}
    
    async with async_session() as session:
        # 1. Test handle category (143)
        print("Fetching products under category 143 (group=True)...")
        products = await read_products(
            request=mock_request,
            db=session,
            category_id=143,
            group=True
        )
        print(f"Total handle products returned: {len(products)}")
        
        # Verify that we don't have duplicate models (e.g. only 1 Stark, 1 Vega, etc.)
        from collections import Counter
        names = [p.name for p in products]
        # Cleaned names
        from app.api.v1.endpoints.products import get_base_model_name
        cleaned_names = [get_base_model_name(p.name) for p in products]
        
        print("\nFirst 10 returned handles:")
        for p in products[:10]:
            print(f"  ID={p.id} | Name='{p.name}' | Mapped='{get_base_model_name(p.name)}' | Image={p.image_url}")
            
        duplicates = [item for item, count in Counter(cleaned_names).items() if count > 1]
        print(f"\nDuplicate base names in grouped list: {duplicates}")
        assert len(duplicates) == 0, f"Error: Duplicates found: {duplicates}"
        print("Success: Grouped handles correctly without duplicates!")

        # 2. Test door category (174)
        print("\nFetching products under category 174 (group=True)...")
        doors = await read_products(
            request=mock_request,
            db=session,
            category_id=174,
            group=True
        )
        print(f"Total door products returned: {len(doors)}")
        door_cleaned_names = [get_base_model_name(d.name).lower().strip() or d.name.lower().strip() for d in doors]
        door_duplicates = [item for item, count in Counter(door_cleaned_names).items() if count > 1]
        print(f"Duplicate door base names in grouped list: {door_duplicates}")
        assert len(door_duplicates) == 0, f"Error: Door duplicates found: {door_duplicates}"
        print("Success: Grouped doors correctly without duplicates!")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
