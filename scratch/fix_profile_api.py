import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_fetch = """        // 2. Fetch orders
        const ordersRes = await fetch("/api/v1/orders/my-orders", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          // Sort orders: latest orders first (by ID descending)
          const sortedOrders = Array.isArray(ordersData) 
            ? ordersData.sort((a: any, b: any) => {
                const idA = parseInt(a.id.replace(/[^\\d]/g, "")) || 0;
                const idB = parseInt(b.id.replace(/[^\\d]/g, "")) || 0;
                return idB - idA;
              })
            : [];
          setOrders(sortedOrders);
        }"""

new_fetch = """        // 2. Fetch orders
        const ordersRes = await fetch("/api/v1/orders/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          // Map to format
          const mappedOrders = Array.isArray(ordersData) ? ordersData.map((o: any) => ({
            id: `ORD-${o.id}`,
            raw_id: o.id,
            date: new Date(o.created_at).toLocaleString('ru-RU'),
            total: o.total_amount.toLocaleString() + " сум",
            status: o.status === 'processed' ? 'Paid' : 'Created',
            items: o.items.length,
            items_list: o.items.map((i: any) => ({
              id: i.product_id || i.id,
              name: i.product_name,
              image: i.product_image || '/placeholder.png',
              price: i.price.toLocaleString() + " сум",
              quantity: i.quantity,
              category: i.product_name
            }))
          })) : [];
          
          const sortedOrders = mappedOrders.sort((a: any, b: any) => b.raw_id - a.raw_id);
          setOrders(sortedOrders);
        }"""

content = content.replace(old_fetch, new_fetch)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Profile API updated")
