const fs = require('fs');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find the last "  return (" which starts the main checkout layout
const mainReturnIndex = content.lastIndexOf('  return (\n    <div className="min-h-screen');

if (mainReturnIndex === -1) {
    console.error("Could not find main return block!");
    process.exit(1);
}

const beforeReturn = content.substring(0, mainReturnIndex);

const newReturn = `  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0f172a]">
      
      {/* LEFT PANEL: Order Summary */}
      <div className="w-full lg:w-1/2 bg-[#f9fafb] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 order-2 lg:order-1 flex justify-center lg:justify-end">
        <div className="w-full max-w-md px-6 py-10 lg:py-16 lg:pr-12 xl:pr-16 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ваш заказ</h2>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
              {items.length} {items.length === 1 ? 'товар' : 'товаров'}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4">Ваша корзина пуста</p>
              <Link href="/catalog" className="text-blue-600 font-medium hover:underline">Вернуться в каталог</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl relative shadow-sm">
                  <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-sm z-10">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.name}</h4>
                    <div className="text-xs text-slate-500 mt-1 space-x-2">
                      {item.category && item.category !== item.name && <span>{item.category}</span>}
                      {item.size && <span>Размер: {item.size}</span>}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                    {(typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/\\D/g, ''))).toLocaleString()} сум
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-8 space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Стоимость товаров</span>
                <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()} сум</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Доставка</span>
                <span className="font-semibold text-slate-900 dark:text-white">Бесплатно</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-base font-bold text-slate-900 dark:text-white">Итого</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{total.toLocaleString()} сум</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Checkout Form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#0f172a] order-1 lg:order-2 flex justify-center lg:justify-start">
        <div className="w-full max-w-md px-6 py-10 lg:py-16 lg:pl-12 xl:pl-16">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Назад в каталог
          </Link>
          
          <form onSubmit={handleCheckout} className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Контактные данные</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Имя и фамилия</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm transition-all"
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email-адрес</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm transition-all"
                  placeholder="example@mail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Номер телефона</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm transition-all"
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Адрес доставки</h3>
                {isLoggedIn && savedAddresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setUseCustomAddress(!useCustomAddress)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {useCustomAddress ? "Сохраненные адреса" : "Новый адрес"}
                  </button>
                )}
              </div>

              {isLoggedIn && !useCustomAddress && savedAddresses.length > 0 ? (
                <div className="grid gap-3">
                  {savedAddresses.map(addr => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={\`p-4 border rounded-xl cursor-pointer transition-all \${
                        selectedAddressId === addr.id 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" 
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }\`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{addr.type}</span>
                        <div className={\`w-4 h-4 rounded-full border flex items-center justify-center \${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}\`}>
                          {selectedAddressId === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{addr.region}, {addr.street}{addr.flat ? \`, кв. \${addr.flat}\` : ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Регион</label>
                    <select 
                      required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Выберите регион</option>
                      {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Улица, дом</label>
                    <input 
                      type="text" 
                      required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm transition-all"
                      placeholder="ул. Амира Темура, д. 45"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Квартира</label>
                      <input 
                        type="text" 
                        value={flat}
                        onChange={(e) => setFlat(e.target.value)}
                        className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm transition-all"
                        placeholder="кв. 12"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Индекс</label>
                      <input 
                        type="text" 
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full h-11 px-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-sm transition-all"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8 shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Оформить заказ на {total.toLocaleString()} сум
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 font-medium">После оформления заказа наш менеджер свяжется с вами для подтверждения.</p>

          </form>
        </div>
      </div>
      
    </div>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn, 'utf8');
console.log('Rewritten checkout page entirely to match the 50/50 layout design!');
