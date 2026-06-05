import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace mapping of formattedItems
old_items = """      const formattedItems = items.map(item => {
        const priceNum = parseInt(item.price.replace(/[^\\d]/g, "")) || 0;
        return {
          product_id: item.id,
          quantity: item.quantity,
          price: priceNum
        };
      });"""

new_items = """      const formattedItems = items.map(item => {
        const priceStr = typeof item.price === 'string' ? item.price : String(item.price);
        const priceNum = parseInt(priceStr.replace(/[^\\d]/g, "")) || 0;
        return {
          product_id: typeof item.id === 'string' ? parseInt(item.id) || null : item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          price: priceNum,
          size: item.size || null,
          color: item.color || null
        };
      });"""

content = content.replace(old_items, new_items)

# Replace orderPayload
old_payload = """      const orderPayload = {
        user_id: user ? user.id : null,
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: shippingAddress || "Самовывоз",
        items: formattedItems,
        payment_method: paymentMethod,
      };"""

new_payload = """      const orderPayload = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: shippingAddress || "Самовывоз",
        comments: email.trim() ? `Email: ${email.trim()}` : "",
        total_amount: total,
        payment_method: paymentMethod || "cod",
        items: formattedItems,
      };"""

content = content.replace(old_payload, new_payload)

# Replace API call path
content = content.replace('"/api/v1/orders/create-deal"', '"/api/v1/orders/"')
content = content.replace('setCreatedDealId(data.deal_id);', 'setCreatedDealId(data.id);')
content = content.replace('sessionStorage.setItem("liberty_last_order_id", String(data.deal_id));', 'sessionStorage.setItem("liberty_last_order_id", String(data.id));')
content = content.replace('router.push(`/checkout/success?order_id=${data.deal_id}`);', 'router.push(`/checkout/success?order_id=${data.id}`);')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Checkout API call updated")
