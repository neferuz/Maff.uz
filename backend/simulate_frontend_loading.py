import asyncio
import httpx

async def main():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Step 1: Fetch the product details (simulate product detail page initialization)
        product_id = 2328
        print(f"1. Fetching product ID {product_id}...")
        res_prod = await client.get(f"/api/v1/products/{product_id}")
        assert res_prod.status_code == 200
        product_data = res_prod.json()
        print(f"Product Loaded: {product_data['name']}")
        print(f"Category ID: {product_data['category_id']}")
        
        # Step 2: Fetch all categories (simulate frontend categories load)
        print("\n2. Fetching categories...")
        res_cats = await client.get("/api/v1/categories?include_inactive=true")
        assert res_cats.status_code == 200
        categories = res_cats.json()
        
        # Find category info for product's category
        cat = next((c for c in categories if c["id"] == product_data["category_id"]), None)
        assert cat is not None
        print(f"Product Category Info: {cat['name']}")
        
        # Traverse up parent categories to find the first configured recommended_accessories
        recs = None
        current_cat = cat
        visited = set()
        print("\n3. Checking category hierarchy for accessories...")
        while current_cat and current_cat["id"] not in visited:
            visited.add(current_cat["id"])
            r = current_cat.get("recommended_accessories")
            has_r = r and (
                (r.get("category_ids") and len(r["category_ids"]) > 0) or
                (r.get("product_ids") and len(r["product_ids"]) > 0)
            )
            if has_r:
                recs = r
                print(f"-> Found accessories configured on category ID {current_cat['id']} ({current_cat['name']})")
                break
            if current_cat.get("parent_id"):
                current_cat = next((c for c in categories if c["id"] == current_cat["parent_id"]), None)
            else:
                break
                
        has_accs = recs is not None
        
        if has_accs:
            print(f"Accessories Title: '{recs.get('title', 'С этим товаром покупают')}'")
            print("Simulating fetching accessory items...")
            
            # Fetch products in each category
            cat_fetch_results = []
            for cid in recs.get('category_ids', []):
                res_c_prods = await client.get(f"/api/v1/products?category_id={cid}&limit=6")
                if res_c_prods.status_code == 200:
                    cat_fetch_results.extend(res_c_prods.json())
                    
            # Fetch individual products
            prod_fetch_results = []
            for pid in recs.get('product_ids', []):
                res_p = await client.get(f"/api/v1/products/{pid}")
                if res_p.status_code == 200:
                    prod_fetch_results.append(res_p.json())
            
            # Combine
            acc_list = prod_fetch_results + cat_fetch_results
            print(f"Loaded {len(prod_fetch_results)} specific product accessories and {len(cat_fetch_results)} category products.")
            
            # Filter duplicates and current product
            seen = set()
            unique_accs = []
            for p in acc_list:
                if not p or p['id'] == product_id or p['id'] in seen:
                    continue
                seen.add(p['id'])
                unique_accs.append(p)
                
            print(f"After deduplication and current product exclusion, {len(unique_accs)} unique accessories remain.")
            print("\nRecommended accessories to display:")
            for p in unique_accs[:4]:
                print(f"- ID: {p['id']}, Name: {p['name']}, Category: {p['category_id']}, Price: {p['price']}")
                
            assert len(unique_accs) > 0
            print("\nSimulation completed successfully! Recommended accessories correctly resolved via inheritance.")
        else:
            print("\nNo accessories configured in category hierarchy. Falling back to similar products.")

if __name__ == "__main__":
    asyncio.run(main())
