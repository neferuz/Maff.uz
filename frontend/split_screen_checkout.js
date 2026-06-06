const fs = require('fs');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const mainReturnIndex = content.lastIndexOf('  return (\n    <div className="min-h-screen');

if (mainReturnIndex === -1) {
    console.error("Could not find main return block!");
    process.exit(1);
}

const beforeReturn = content.substring(0, mainReturnIndex);

const newReturn = `  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      
      {/* LEFT PANEL: Checkout Form (White background) */}
      <div className="w-full lg:w-7/12 bg-white dark:bg-[#0f172a] order-2 lg:order-1 flex justify-center lg:justify-end px-4 md:px-8 xl:px-12 py-8 md:py-12">
        <div className="w-full max-w-xl">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors w-fit bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            <ArrowLeft className="w-3.5 h-3.5" />
            Назад в каталог
          </Link>

          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-10">
            
            {/* Contact Info */}
            <div>
              <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-6">
                Контактные данные
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Имя и фамилия <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm transition-all"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email-адрес <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm transition-all"
                      placeholder="example@mail.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Номер телефона <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm transition-all"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Адрес доставки</h3>
                {isLoggedIn && savedAddresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setUseCustomAddress(!useCustomAddress)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider"
                  >
                    {useCustomAddress ? "Выбрать из сохраненных" : "Новый адрес"}
                  </button>
                )}
              </div>

              {isLoggedIn && !useCustomAddress && savedAddresses.length > 0 ? (
                <div className="grid gap-3">
                  {savedAddresses.map(addr => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={\`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 \${
                        selectedAddressId === addr.id 
                          ? "border-slate-900 bg-slate-50 dark:bg-slate-800/50" 
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }\`}
                    >
                      <div className={\`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 \${selectedAddressId === addr.id ? 'border-slate-900 bg-slate-900' : 'border-slate-300'}\`}>
                        {selectedAddressId === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block mb-0.5">{addr.type}</span>
                        <p className="text-[13px] text-slate-500">{addr.region}, {addr.street}{addr.flat ? \`, кв. \${addr.flat}\` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Регион <span className="text-red-500">*</span></label>
                    <select 
                      required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Выберите регион</option>
                      {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Улица, дом <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm transition-all"
                      placeholder="ул. Амира Темура, д. 45"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Квартира</label>
                      <input 
                        type="text" 
                        value={flat}
                        onChange={(e) => setFlat(e.target.value)}
                        className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm transition-all"
                        placeholder="кв. 12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Индекс</label>
                      <input 
                        type="text" 
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full h-12 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm transition-all"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorMsg}
              </div>
            )}
            
            {/* Form actions on mobile (hidden on desktop) */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full h-12 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-6"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>Оформить заказ на {total.toLocaleString()} сум</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: Order Summary (Light Grey background spanning full height) */}
      <div className="w-full lg:w-5/12 bg-[#f4f5f7] dark:bg-slate-900/50 order-1 lg:order-2 flex justify-center lg:justify-start px-4 md:px-8 xl:px-12 py-8 md:py-12 border-l border-slate-200 dark:border-slate-800/50">
        <div className="w-full max-w-md lg:sticky lg:top-8 self-start">
          
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Ваш заказ</h3>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{items.length} {items.length === 1 ? 'товар' : 'товаров'}</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4 text-sm font-medium">Ваша корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-300">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <div className="absolute top-0 right-0 w-5 h-5 bg-slate-900/90 backdrop-blur-sm rounded-bl-lg flex items-center justify-center text-[10px] font-bold text-white z-10">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2 leading-snug">{item.name}</h4>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                      {item.size && <span>Размер: {item.size}</span>}
                    </div>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white shrink-0 tracking-tight">
                    {(typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/\\D/g, ''))).toLocaleString()} сум
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-8 space-y-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Стоимость товаров</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">{total.toLocaleString()} сум</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Доставка</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">Бесплатно</span>
              </div>
              <div className="flex justify-between items-end pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Итого</span>
                <span className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{total.toLocaleString()} сум</span>
              </div>

              {/* Desktop CTA */}
              <button
                type="submit"
                form="checkout-form"
                disabled={loading || items.length === 0}
                className="hidden lg:flex w-full h-12 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold uppercase tracking-wider rounded-xl text-xs items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>Оформить заказ</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn, 'utf8');
console.log('Split screen checkout logic applied');
