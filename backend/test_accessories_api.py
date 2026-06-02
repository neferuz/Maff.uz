import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # 1. Fetch categories
        print("Fetching categories...")
        res = await client.get("/api/v1/categories?include_inactive=true")
        assert res.status_code == 200
        cats = res.json()
        print(f"Loaded {len(cats)} categories.")
        
        # Pick one top-level category with product_count > 0 or just first category
        target_cat = None
        other_cat = None
        for c in cats:
            if not c.get("parent_id"):
                if not target_cat:
                    target_cat = c
                elif not other_cat:
                    other_cat = c
                    break
        
        if not target_cat or not other_cat:
            print("Could not find two categories to test.")
            return

        print(f"Target Category: ID={target_cat['id']} ({target_cat['name']})")
        print(f"Other Category: ID={other_cat['id']} ({other_cat['name']})")
        
        # 2. Update recommended accessories
        config = {
            "category_ids": [other_cat["id"]],
            "product_ids": [3512]
        }
        
        print("Updating category recommended accessories...")
        update_res = await client.put(
            f"/api/v1/categories/{target_cat['id']}",
            json={
                "name": target_cat["name"],
                "recommended_accessories": config
            }
        )
        print("Update status code:", update_res.status_code)
        assert update_res.status_code == 200
        updated_cat = update_res.json()
        print("Updated category payload:", updated_cat)
        assert updated_cat.get("recommended_accessories") == config
        
        # 3. Retrieve categories and check if it persists
        print("Retrieving categories again...")
        get_res = await client.get("/api/v1/categories?include_inactive=true")
        cats_again = get_res.json()
        fetched_cat = next(c for c in cats_again if c["id"] == target_cat["id"])
        print("Fetched category payload:", fetched_cat)
        assert fetched_cat.get("recommended_accessories") == config
        
        # 4. Clean up / reset config
        print("Cleaning up recommended accessories...")
        reset_res = await client.put(
            f"/api/v1/categories/{target_cat['id']}",
            json={
                "name": target_cat["name"],
                "recommended_accessories": None
            }
        )
        assert reset_res.status_code == 200
        print("Verification script completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
