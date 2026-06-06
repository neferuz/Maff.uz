const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const returnIndex = content.lastIndexOf('  return (\n    <div className="min-h-screen');
const beforeReturn = content.substring(0, returnIndex);

const newReturn = `  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-[#0b1120] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start font-sans">
      
        {/* LEFT PANEL: Checkout Form */}
        <div className="w-full lg:w-7/12 order-2 lg:order-1 space-y-6">
          <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors w-fit bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            Назад в каталог
          </Link>

          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
            
            {/* Contact Info */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-6">
                Контактные данные
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Имя и фамилия <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm transition-all"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email-адрес <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm transition-all"
                      placeholder="example@mail.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Номер телефона <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm transition-all"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Адрес доставки</h3>
                {isLoggedIn && savedAddresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setUseCustomAddress(!useCustomAddress)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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
                        <span className="font-semibold text-sm text-slate-900 dark:text-white block mb-0.5">{addr.type}</span>
                        <p className="text-sm text-slate-500">{addr.region}, {addr.street}{addr.flat ? \`, кв. \${addr.flat}\` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Регион <span className="text-red-500">*</span></label>
                    <select 
                      required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Выберите регион</option>
                      {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Улица, дом <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm transition-all"
                      placeholder="ул. Амира Темура, д. 45"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Квартира</label>
                      <input 
                        type="text" 
                        value={flat}
                        onChange={(e) => setFlat(e.target.value)}
                        className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm transition-all"
                        placeholder="кв. 12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Индекс</label>
                      <input 
                        type="text" 
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full h-12 px-4 border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50 dark:bg-slate-800 text-sm transition-all"
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorMsg}
              </div>
            )}
            
            {/* Form actions on mobile (hidden on desktop) */}
            <div className="lg:hidden">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-6"
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

        {/* RIGHT PANEL: Order Summary */}
        <div className="w-full lg:w-5/12 order-1 lg:order-2">
          <div className="w-full lg:sticky lg:top-8 self-start bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">
            
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Ваш заказ</h3>
              <span className="text-slate-500 text-sm font-medium">{items.length} {items.length === 1 ? 'товар' : 'товаров'}</span>
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
                      <div className="absolute top-0 right-0 w-6 h-6 bg-slate-900/90 backdrop-blur-sm rounded-bl-lg flex items-center justify-center text-xs font-bold text-white z-10">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{item.name}</h4>
                      <div className="text-xs text-slate-500 mt-1">
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
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Стоимость товаров</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()} сум</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Доставка</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Бесплатно</span>
                </div>
                <div className="flex justify-between items-end pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Итого</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{total.toLocaleString()} сум</span>
                </div>

                {/* Desktop CTA */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading || items.length === 0}
                  className="hidden lg:flex w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold uppercase tracking-wider rounded-xl text-xs items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8"
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
    </div>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn, 'utf8');
console.log('Fixed completely using full return rewrite');
