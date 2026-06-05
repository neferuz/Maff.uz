import urllib.request
import json

try:
    response = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/categories")
    categories = json.loads(response.read().decode('utf-8'))
    print(f"Total categories from API: {len(categories)}")
    
    # Let's print category 174, 448, 449, 450, etc.
    target_ids = {174, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 426, 427, 428, 429, 430, 431}
    print("\nTarget categories in API response:")
    for c in categories:
        if c['id'] in target_ids or c['parent_id'] in target_ids:
            print(f"ID: {c['id']}, Name: '{c['name']}', Parent ID: {c['parent_id']}, Product Count: {c['product_count']}")
except Exception as e:
    print("Error:", e)
