import re

file_path = "/Users/apple/Desktop/Maff.uz-main/admin-panel/src/app/orders/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace mock orders with state and effect
mock_orders_str = """const orders = [
  { id: "ORD-7281", customer: "Александр Соколов", date: "Сегодня, 15:30", total: "24,500,000 сум", status: "Paid", items: 3, method: "Visa •••• 4242" },
  { id: "ORD-7280", customer: "Анна Кузнецова", date: "Сегодня, 14:15", total: "12,900,000 сум", status: "Shipped", items: 1, method: "Apple Pay" },
  { id: "ORD-7279", customer: "Максим Белов", date: "Вчера, 18:45", total: "45,000,000 сум", status: "Pending", items: 5, method: "Mastercard •••• 5555" },
  { id: "ORD-7278", customer: "Виктория Ли", date: "Вчера, 16:20", total: "8,400,000 сум", status: "Paid", items: 2, method: "Google Pay" },
  { id: "ORD-7277", customer: "Артем Дзюба", date: "Вчера, 12:10", total: "15,600,000 сум", status: "Cancelled", items: 4, method: "Visa •••• 1111" },
  { id: "ORD-7276", customer: "София Ротару", date: "05 мая, 10:00", total: "3,200,000 сум", status: "Paid", items: 1, method: "Visa •••• 9999" },
  { id: "ORD-7275", customer: "Иван Ургант", date: "04 мая, 09:30", total: "5,500,000 сум", status: "Paid", items: 2, method: "Apple Pay" },
  { id: "ORD-7274", customer: "Ксения Собчак", date: "04 мая, 08:45", total: "22,000,000 сум", status: "Shipped", items: 3, method: "Mastercard •••• 2222" },
  { id: "ORD-7273", customer: "Павел Воля", date: "03 мая, 20:15", total: "1,200,000 сум", status: "Cancelled", items: 1, method: "Google Pay" },
  { id: "ORD-7272", customer: "Гарик Харламов", date: "03 мая, 18:00", total: "9,800,000 сум", status: "Paid", items: 2, method: "Visa •••• 3333" },
  { id: "ORD-7271", customer: "Тимур Батрутдинов", date: "02 мая, 15:40", total: "11,500,000 сум", status: "Pending", items: 4, method: "Apple Pay" },
  { id: "ORD-7270", customer: "Дмитрий Нагиев", date: "01 мая, 12:00", total: "34,000,000 сум", status: "Shipped", items: 6, method: "Visa •••• 7777" },
];"""

new_state = """
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("maff_admin_token") || localStorage.getItem("admin_token") || "";
      const res = await fetch("/api/v1/orders/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((o: any) => ({
          id: o.id,
          display_id: `ORD-${o.id}`,
          customer: o.full_name || "—",
          phone: o.phone || "—",
          address: o.address || "—",
          comments: o.comments || "",
          date: new Date(o.created_at).toLocaleString('ru-RU'),
          total: o.total_amount.toLocaleString() + " сум",
          raw_total: o.total_amount,
          status: o.status === 'processed' ? 'Paid' : 'Pending',
          raw_status: o.status,
          items: o.items.length,
          method: o.payment_method === 'cod' ? 'При получении' : o.payment_method,
          raw_items: o.items
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem("maff_admin_token") || localStorage.getItem("admin_token") || "";
      await fetch(`/api/v1/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
    }
  };
"""

content = content.replace(mock_orders_str, "")

# Find the start of the component `export default function OrdersPage() {`
component_start = "export default function OrdersPage() {"
content = content.replace(component_start, component_start + new_state)

# Fix selectedOrder type
content = content.replace("useState<typeof orders[0] | null>(null)", "useState<any | null>(null)")

# Fix search query using display_id
content = content.replace("order.id.toLowerCase().includes(searchQuery.toLowerCase())", "order.display_id.toLowerCase().includes(searchQuery.toLowerCase())")

# In the table map, change order.id to order.display_id
content = content.replace('{order.id}</span>', '{order.display_id}</span>')
content = content.replace('key={order.id}', 'key={order.display_id}')
content = content.replace('{selectedOrder.id}</p>', '{selectedOrder.display_id}</p>')

# In the modal footer, add update status button
old_footer = """              {/* Sticky Footer Actions */}
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 grid grid-cols-2 gap-3 sticky bottom-0">
                 <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all no-shadow">
                    <ExternalLink className="w-4 h-4" />
                    Чек
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all">
                    Отправить
                 </button>
              </div>"""

new_footer = """              {/* Order Items List */}
              <div className="px-6 py-4 border-t border-[#e3e8ee]">
                <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-3">Список товаров</h3>
                <div className="space-y-3">
                  {selectedOrder.raw_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-[12px] bg-[#f7f8f9] p-2 rounded-lg border border-[#e3e8ee]">
                      <div className="flex flex-col max-w-[70%]">
                         <span className="font-bold text-[#1a1f36] truncate">{item.product_name}</span>
                         <span className="text-[#4f566b] text-[10px]">
                           {item.size ? `Размер: ${item.size} ` : ''} 
                           {item.color ? `Цвет: ${item.color}` : ''}
                         </span>
                      </div>
                      <div className="text-right">
                         <span className="font-bold text-[#2c3b6e] block">{item.price.toLocaleString()} сум</span>
                         <span className="text-[#4f566b] text-[10px]">Кол-во: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e3e8ee]">
                <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">Адрес доставки и Контакты</h3>
                <p className="text-[12px] text-[#4f566b] mb-1"><strong>Тел:</strong> {selectedOrder.phone}</p>
                <p className="text-[12px] text-[#4f566b] mb-1"><strong>Адрес:</strong> {selectedOrder.address}</p>
                {selectedOrder.comments && <p className="text-[12px] text-[#4f566b]"><strong>Комментарий:</strong> {selectedOrder.comments}</p>}
              </div>

              {/* Sticky Footer Actions */}
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 grid grid-cols-2 gap-3 sticky bottom-0">
                 {selectedOrder.raw_status === 'pending' ? (
                   <button onClick={() => updateStatus(selectedOrder.id, 'processed')} className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10b981] rounded-xl text-[13px] font-bold text-white hover:bg-[#059669] transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                      Отметить как Обработан
                   </button>
                 ) : (
                   <button onClick={() => updateStatus(selectedOrder.id, 'pending')} className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all no-shadow">
                      <Clock className="w-4 h-4" />
                      Вернуть в Ожидание
                   </button>
                 )}
              </div>"""

content = content.replace(old_footer, new_footer)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Admin orders updated")
