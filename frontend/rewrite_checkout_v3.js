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
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#0b1120] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        
        <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Назад в каталог
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* LEFT PANEL: Checkout Form (Cards) */}
          <div className="w-full lg:w-3/5 space-y-6 order-1">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              
              {/* Contact Info Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  Контактные данные
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-700 dark:text-slate-300">Имя и фамилия <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base transition-all"
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-700 dark:text-slate-300">Email-адрес <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base transition-all"
                        placeholder="example@mail.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-700 dark:text-slate-300">Номер телефона <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base transition-all"
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white">Адрес доставки</h3>
                  {isLoggedIn && savedAddresses.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setUseCustomAddress(!useCustomAddress)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                        className={\`p-5 border rounded-2xl cursor-pointer transition-all flex items-center gap-4 \${
                          selectedAddressId === addr.id 
                            ? "border-slate-900 bg-slate-50 dark:bg-slate-800/50" 
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }\`}
                      >
                        <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 \${selectedAddressId === addr.id ? 'border-slate-900 bg-slate-900' : 'border-slate-300'}\`}>
                          {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <span className="font-semibold text-sm md:text-base text-slate-900 dark:text-white block mb-0.5">{addr.type}</span>
                          <p className="text-sm text-slate-500">{addr.region}, {addr.street}{addr.flat ? \`, кв. \${addr.flat}\` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-700 dark:text-slate-300">Регион <span className="text-red-500">*</span></label>
                      <select 
                        required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base appearance-none cursor-pointer"
                      >
                        <option value="">Выберите регион</option>
                        {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-slate-700 dark:text-slate-300">Улица, дом <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base transition-all"
                        placeholder="ул. Амира Темура, д. 45"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-700 dark:text-slate-300">Квартира</label>
                        <input 
                          type="text" 
                          value={flat}
                          onChange={(e) => setFlat(e.target.value)}
                          className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base transition-all"
                          placeholder="кв. 12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-700 dark:text-slate-300">Индекс</label>
                        <input 
                          type="text" 
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="w-full h-12 md:h-14 px-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white dark:bg-slate-800 text-sm md:text-base transition-all"
                          placeholder="100000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT PANEL: Order Summary Card */}
          <div className="w-full lg:w-2/5 order-2 lg:sticky lg:top-6">
            <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white">Ваш заказ</h3>
                <span className="text-slate-500 text-sm font-medium">{items.length} {items.length === 1 ? 'товар' : 'товаров'}</span>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 mb-4">Ваша корзина пуста</p>
                  <Link href="/catalog" className="text-blue-600 font-medium hover:underline">Вернуться в каталог</Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 -mr-2">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-slate-900/80 backdrop-blur-sm rounded-bl-xl flex items-center justify-center text-[11px] font-bold text-white z-10">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-grow min-w-0 flex flex-col h-20 justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{item.name}</h4>
                          <div className="text-[12px] text-slate-500 mt-1 space-x-2">
                            {item.size && <span>Размер: {item.size}</span>}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {(typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/\\D/g, ''))).toLocaleString()} сум
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <>
                  <div className="mt-6 space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-base">
                      <span className="text-slate-600 dark:text-slate-400">Стоимость товаров</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()} сум</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-slate-600 dark:text-slate-400">Доставка</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Бесплатно</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Итого</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{total.toLocaleString()} сум</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading || items.length === 0}
                    className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Оформить заказ
                      </>
                    )}
                  </button>
                  <p className="text-[12px] text-center text-slate-500 mt-4 leading-relaxed">
                    Нажимая кнопку «Оформить заказ», вы соглашаетесь с условиями обработки персональных данных.
                  </p>
                </>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, beforeReturn + newReturn, 'utf8');
console.log('Rewritten checkout page to match card style');
