import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Get category first to keep existing data
        res = await client.get("/api/v1/categories?include_inactive=true")
        assert res.status_code == 200
        cats = res.json()
        target_cat = next(c for c in cats if c["id"] == 176)
        
        config = {
            "category_ids": [143],
            "product_ids": [3143]
        }
        
        print(f"Current Category 176 payload: {target_cat}")
        print("Updating Category 176 recommended accessories...")
        
        update_res = await client.put(
            "/api/v1/categories/176",
            json={
                "name": target_cat["name"],
                "recommended_accessories": config,
                "parent_id": target_cat["parent_id"],
                "is_order_only": target_cat["is_order_only"],
                "is_preorder": target_cat["is_preorder"],
                "price_prefix": target_cat["price_prefix"],
                "order_link": target_cat["order_link"],
                "sort_order": target_cat["sort_order"]
            }
        )
        print("Update status code:", update_res.status_code)
        if update_res.status_code == 200:
            print("Successfully updated category recommended accessories!")
            print("Response:", update_res.json())
        else:
            print("Failed to update! Response:", update_res.text)

if __name__ == "__main__":
    asyncio.run(main())
