"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/shop-context";
import { MapPin, User, Phone, Mail, ShoppingBag, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Clock, HelpCircle, XCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const UZBEKISTAN_REGIONS = [
  "Ташкент",
  "Ташкентская область",
  "Самаркандская область",
  "Бухарская область",
  "Андижанская область",
  "Ферганская область",
  "Наманганская область",
  "Кашкадарьинская область",
  "Сурхандарьинская область",
  "Навоийская область",
  "Джизакская область",
  "Сырдарьинская область",
  "Хорезмская область",
  "Республика Каракалпакстан"
];

const formatUzPhone = (value: string): string => {
  if (!value) return "+998";
  const digits = value.replace(/\D/g, "");
  let suffix = digits;
  if (suffix.startsWith("998")) {
    suffix = suffix.substring(3);
  }
  const part1 = suffix.substring(0, 2);
  const part2 = suffix.substring(2, 5);
  const part3 = suffix.substring(5, 7);
  const part4 = suffix.substring(7, 9);
  
  let formatted = "+998";
  if (part1) formatted += " " + part1;
  if (part2) formatted += " " + part2;
  if (part3) formatted += " " + part3;
  if (part4) formatted += " " + part4;
  return formatted;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: items, removeFromCart: removeItem, addToCart: addItem } = useShop();
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal.length < 4) {
      setPhone("+998");
      return;
    }
    setPhone(formatUzPhone(inputVal));
  };
  
  // Authentication & User State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998");
  
  // Custom/New Address Form State
  const [region, setRegion] = useState("");
  const [street, setStreet] = useState("");
  const [flat, setFlat] = useState("");
  const [zip, setZip] = useState("");
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  // Success Order State
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderTotalAmount, setOrderTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [lastCartItems, setLastCartItems] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [methodChanging, setMethodChanging] = useState(false);

  const handlePaymentMethodChange = async (newMethod: string) => {
    if (!createdDealId || methodChanging) return;
    setMethodChanging(true);
    try {
      const res = await fetch(`/api/v1/orders/ORD-${createdDealId}/payment-method`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: newMethod,
          status: newMethod === "cod" ? "Created" : "Pending"
        })
      });
      if (res.ok) {
        setPaymentMethod(newMethod);
        setPaymentStatus("pending");
        if (typeof window !== "undefined") {
          sessionStorage.setItem("liberty_last_order_method", newMethod);
        }
      } else {
        alert("Не удалось изменить способ оплаты. Попробуйте еще раз.");
      }
    } catch (err) {
      console.error("Error switching payment method:", err);
      alert("Ошибка при изменении способа оплаты.");
    } finally {
      setMethodChanging(false);
    }
  };

  // Fix hydration issues by only rendering client-side content after mount
  useEffect(() => {
    setIsClient(true);
    fetchUserProfile();
  }, []);

  // Real-time payment verification background poller
  useEffect(() => {
    if (!orderSuccess || (paymentMethod !== "click" && paymentMethod !== "payme") || !createdDealId || paymentStatus === "paid") return;

    let intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/orders/ORD-${createdDealId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "Paid") {
            setPaymentStatus("paid");
            clearInterval(intervalId);
          } else if (data.status === "Cancelled") {
            setPaymentStatus("failed");
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Poller error checking payment status:", err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [orderSuccess, paymentMethod, createdDealId, paymentStatus]);

  // Dynamic Click script loading when success page shows up
  useEffect(() => {
    if (orderSuccess) {
      const script = document.createElement("script");
      script.src = "https://my.click.uz/static/pay-by-card.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        const existingScript = document.querySelector('script[src="https://my.click.uz/static/pay-by-card.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [orderSuccess]);

  const handlePayByCard = () => {
    if (typeof window !== "undefined" && (window as any).createPaymentRequest) {
      (window as any).createPaymentRequest({
        merchant_id: "45275",
        service_id: "101626",
        transaction_param: `ORD-${createdDealId}`,
        amount: String(orderTotalAmount),
        merchant_user_id: "83104",
      }, async (data: any) => {
        console.log("CLICK card payment response:", data);
        if (data.status === 2) {
          try {
            await fetch("/api/v1/orders/payment-callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                deal_id: createdDealId,
                status: "paid"
              })
            });
            alert("Оплата успешно проведена! Спасибо за заказ.");
            window.location.href = "/profile";
          } catch (e) {
            console.error("Failed to update status after payment success:", e);
            alert("Оплата успешно проведена! Спасибо за заказ.");
            window.location.href = "/profile";
          }
        } else if (data.status < 0) {
          alert(`Ошибка оплаты: ${data.status}`);
        }
      });
    } else {
      alert("Скрипт Click загружается. Пожалуйста, попробуйте еще раз через секунду.");
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    
    setProfileLoading(true);
    try {
      const res = await fetch("/api/v1/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsLoggedIn(true);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setPhone(formatUzPhone(data.phone || "+998"));
        
        if (data.addresses_json) {
          try {
            const parsed = JSON.parse(data.addresses_json);
            setSavedAddresses(parsed);
            if (parsed.length > 0) {
              setSelectedAddressId(parsed[0].id);
              setUseCustomAddress(false);
            } else {
              setUseCustomAddress(true);
            }
          } catch (e) {
            console.error("Error parsing addresses:", e);
            setUseCustomAddress(true);
          }
        } else {
          setUseCustomAddress(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setIsLoggedIn(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    if (!fullName || !email || !phone) {
      setErrorMsg("Пожалуйста, заполните основные контактные данные.");
      return;
    }

    // Prepare address detail
    let shippingAddress = "";
    if (isLoggedIn && !useCustomAddress && selectedAddressId) {
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (activeAddr) {
        shippingAddress = `${activeAddr.type || 'Адрес'}: Узбекистан, ${activeAddr.region || ''}, ${activeAddr.street || ''}, кв. ${activeAddr.flat || ''}, ${activeAddr.zip || ''}`;
      }
    } else {
      if (!region || !street) {
        setErrorMsg("Пожалуйста, укажите город/регион и улицу доставки.");
        return;
      }
      shippingAddress = `Новый адрес: Узбекистан, ${region}, ${street}, кв. ${flat || '—'}, ${zip || '—'}`;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // Parse items to backend format
      const formattedItems = items.map(item => {
        const priceStr = typeof item.price === 'string' ? item.price : String(item.price);
        const priceNum = parseInt(priceStr.replace(/[^\d]/g, "")) || 0;
        return {
          product_id: typeof item.id === 'string' ? parseInt(item.id) || null : item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          price: priceNum,
          size: item.size || null,
          color: item.color || null
        };
      });

      const orderPayload = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: shippingAddress || "Самовывоз",
        comments: email.trim() ? `Email: ${email.trim()}` : "",
        total_amount: total,
        payment_method: paymentMethod || "cod",
        items: formattedItems,
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: any = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setOrderTotalAmount(total);
        setCreatedDealId(data.id);
        setLastCartItems([...items]);
        setPaymentStatus("pending");
        
        // Save states in sessionStorage to handle browser Back button gracefully
        if (typeof window !== "undefined") {
          sessionStorage.setItem("liberty_last_order_id", String(data.id));
          sessionStorage.setItem("liberty_last_order_success", "true");
          sessionStorage.setItem("liberty_last_order_method", paymentMethod);
          sessionStorage.setItem("liberty_last_order_amount", String(total));
          sessionStorage.setItem("liberty_last_cart_snapshot", JSON.stringify(items));
        }

        // Clear cart
        items.forEach(item => removeItem(item.id));
        
        // Redirect to new checkout success page
        router.push(`/checkout/success?order_id=${data.id}`);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Не удалось оформить заказ. Попробуйте еще раз.");
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg("Ошибка соединения с сервером. Пожалуйста, проверьте интернет.");
    } finally {
      setLoading(false);
    }
  };

  // Render Loading Placeholder (Apple-style premium minimalist spinner)
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full border-[1.5px] border-slate-100 dark:border-slate-800" />
            <div className="absolute inset-0 rounded-full border-[1.5px] border-t-slate-800 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Загрузка</span>
        </div>
      </div>
    );
  }


  // Render Success Page
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f172a] flex flex-col justify-between">
        
        <main className="flex-grow pt-24 pb-16 px-6 flex items-center justify-center">
          <div className="max-w-md w-full text-center py-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
                paymentMethod === "click"
                  ? paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                    : paymentStatus === "failed"
                    ? "bg-rose-50 text-rose-500 border-rose-100"
                    : "bg-amber-50 text-amber-500 border-amber-100"
                  : "bg-emerald-50 text-emerald-500 border-emerald-100"
              }`}
            >
              {paymentMethod === "click" ? (
                paymentStatus === "paid" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : paymentStatus === "failed" ? (
                  <XCircle className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6 animate-pulse" />
                )
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
              className="text-xl md:text-2xl font-black uppercase tracking-widest font-black text-[#2c3b6e] dark:text-white mb-2 leading-none"
            >
              {paymentMethod === "click" ? (
                paymentStatus === "paid" ? "Заказ оформлен" :
                paymentStatus === "failed" ? "Ошибка оплаты" :
                "Ожидание оплаты"
              ) : (
                "Заказ оформлен"
              )}
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="h-[2px] bg-[#2c3b6e] mx-auto mb-3" 
            />
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
              className="text-[13px] text-slate-600 dark:text-slate-300 mb-1 leading-relaxed"
            >
              Благодарим за выбор <span className="font-bold text-[#2c3b6e] dark:text-white">Maff.uz</span>!
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
              className="text-[13px] text-slate-600 dark:text-slate-300 mb-3"
            >
              Номер вашего заказа: <span className="font-extrabold text-[#2c3b6e] dark:text-white">#{createdDealId}</span>
            </motion.p>

            {paymentMethod === "click" || paymentMethod === "payme" ? (
              /* Online Payment Container with Status Handler */
              <div className="max-w-sm mx-auto">
                {paymentStatus === "paid" ? (
                  /* Paid successfully state */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl text-center space-y-2 mb-4"
                  >
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Оплата подтверждена! 🎉</h3>
                      <p className="text-[9.5px] text-emerald-600 mt-0.5 leading-relaxed">
                        Ваш заказ успешно оплачен онлайн через {paymentMethod === "payme" ? "Payme" : "CLICK"}. Мы уже собираем его для вас!
                      </p>
                    </div>
                  </motion.div>
                ) : paymentStatus === "failed" ? (
                  /* Payment failed or cancelled state */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-rose-50/50 border border-rose-200 p-4 rounded-2xl text-center space-y-2 mb-4"
                  >
                    <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-800">Оплата отклонена ❌</h3>
                      <p className="text-[9.5px] text-rose-600 mt-0.5 leading-relaxed">
                        Платеж был отклонен или отменен. Пожалуйста, попробуйте оплатить заново или вернитесь к оформлению заказа.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* Pending Payment state */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-[#e3e8ee] p-4 rounded-2xl text-center space-y-3 mb-4"
                  >
                    <div className="flex items-center justify-center gap-1.5 py-0.5 px-2 bg-amber-50 border border-amber-100/70 rounded-2xl w-fit mx-auto">
                      <Clock className="w-2.5 h-2.5 text-amber-500 animate-pulse shrink-0" />
                      <span className="text-[8px] text-amber-700 font-bold uppercase tracking-wider">Ожидаем онлайн-оплату</span>
                    </div>

                    <div className="pb-1.5 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="text-[10px] font-black uppercase tracking-wider text-[#2c3b6e] dark:text-white">Оплатить заказ онлайн</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Сумма к оплате: <span className="font-extrabold text-[#2c3b6e] dark:text-white">{orderTotalAmount.toLocaleString()} сум</span></p>
                    </div>

                    <div className="pt-0.5">
                      {paymentMethod === "payme" ? (
                        /* Method 2: Payme Redirect Link */
                        <a
                          href={(() => {
                            const merchantId = "69454dd1656e7b8e815da033"; // Standard Payme merchant ID for yustex
                            const amountTiyin = orderTotalAmount * 100;
                            const params = `m=${merchantId};ac.order_id=ORD-${createdDealId};a=${amountTiyin};c=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/profile" : "")}`;
                            const base64Params = btoa(unescape(encodeURIComponent(params)));
                            return `https://checkout.paycom.uz/${base64Params}`;
                          })()}
                          className="block"
                        >
                          <button
                            type="button"
                            className="w-full py-2.5 px-4 bg-[#00bfa5] hover:bg-[#00a892] text-white font-extrabold text-[9.5px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] rounded-2xl border-none "
                          >
                            <img 
                              src="https://cdn.payme.uz/logo/payme_color.svg" 
                              alt="Payme" 
                              className="h-3 w-auto brightness-0 invert shrink-0" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://payme.uz/svg/payme-logo.svg";
                              }}
                            />
                            Оплатить через Payme
                          </button>
                        </a>
                      ) : (
                        /* Method 1: CLICK UP Application/Site */
                        <a
                          href={`https://my.click.uz/services/pay?service_id=101626&merchant_id=45275&amount=${orderTotalAmount}&transaction_param=ORD-${createdDealId}&merchant_user_id=83104&return_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/profile" : "")}`}
                          className="block"
                        >
                          <button
                            type="button"
                            className="w-full py-2.5 px-4 bg-[#27a8e0] hover:bg-[#1b93cb] text-white font-extrabold text-[9.5px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] rounded-2xl"
                          >
                            <i className="w-4 h-4 bg-contain bg-no-repeat bg-center shrink-0" style={{ backgroundImage: "url(https://m.click.uz/static/img/logo.png)" }} />
                            Оплатить через CLICK
                          </button>
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}

              </div>
            ) : (
              /* Cash / COD Success Card */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                className="bg-slate-50 dark:bg-slate-800/50 border border-[#e3e8ee] p-4 rounded-2xl max-w-sm mx-auto mb-6 text-center space-y-2"
              >
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[#2c3b6e] dark:text-white">Способ оплаты</h3>
                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed">
                  Выбранный способ: <span className="font-bold text-[#2c3b6e] dark:text-white">При получении</span>. 
                  Пожалуйста, подготовьте <span className="font-bold text-[#2c3b6e] dark:text-white">{orderTotalAmount.toLocaleString()} сум</span> для передачи курьеру наличными или картой через терминал.
                </p>
              </motion.div>
            )}

            {paymentStatus !== "paid" && (
              <div className="max-w-sm mx-auto mb-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-2.5">
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {methodChanging ? "Обновление..." : "Изменить способ оплаты"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={methodChanging || paymentMethod === "click"}
                    onClick={() => handlePaymentMethodChange("click")}
                    className={`py-2 px-1 text-[8.5px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all border rounded-2xl cursor-pointer ${
                      paymentMethod === "click"
                        ? "bg-[#27a8e0]/5 border-[#27a8e0] text-[#27a8e0]"
                        : "bg-white dark:bg-[#0f172a] border-slate-100/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <i className="w-3.5 h-3.5 bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: "url(https://m.click.uz/static/img/logo.png)" }} />
                    CLICK
                  </button>
                  
                  <button
                    type="button"
                    disabled={methodChanging || paymentMethod === "payme"}
                    onClick={() => handlePaymentMethodChange("payme")}
                    className={`py-2 px-1 text-[8.5px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all border rounded-2xl cursor-pointer ${
                      paymentMethod === "payme"
                        ? "bg-[#00bfa5]/5 border-[#00bfa5] text-[#00bfa5]"
                        : "bg-white dark:bg-[#0f172a] border-slate-100/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <img src="https://cdn.payme.uz/logo/payme_color.svg" alt="Payme" className="h-3.5 w-auto mx-auto" />
                    Payme
                  </button>

                  <button
                    type="button"
                    disabled={methodChanging || paymentMethod === "cod"}
                    onClick={() => handlePaymentMethodChange("cod")}
                    className={`py-2 px-1 text-[8.5px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all border rounded-2xl cursor-pointer ${
                      paymentMethod === "cod"
                        ? "bg-[#2c3b6e]/5 dark:bg-blue-900/20 border-[#2c3b6e] text-[#2c3b6e] dark:text-white"
                        : "bg-white dark:bg-[#0f172a] border-slate-100/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Наличные
                  </button>
                </div>
              </div>
            )}
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
              className="text-[12px] text-slate-400 dark:text-slate-500 leading-relaxed mb-0 max-w-sm mx-auto"
            >
              Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей.
            </motion.p>
          </div>
        </main>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex flex-col justify-between">
      
      
      <main className="flex-grow pt-10 md:pt-14 pb-16 relative z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          {items.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-800 mx-auto mb-4">
                <ShoppingBag className="w-5 h-5 text-slate-300" strokeWidth={1} />
              </div>
              <h2 className="text-xs font-bold text-[#2c3b6e] dark:text-white mb-1">Ваша корзина пуста</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed mb-6">
                Добавьте хотя бы один товар в корзину, чтобы перейти к оформлению покупки.
              </p>
              <Link href="/shop">
                <button className="px-6 h-10 bg-[#2c3b6e] rounded-xl text-white text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all">
                  Перейти в каталог
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* Left Column: Form & Address Details */}
              <div className="lg:col-span-7 space-y-4 md:space-y-6">
                
                {/* Mobile-only Collapsible Order Summary Card */}
                <div className="lg:hidden bg-slate-50 dark:bg-slate-800/50 p-4 border rounded-2xl border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#2c3b6e] dark:text-white tracking-tight">Ваш заказ ({items.length})</span>
                    <button 
                      type="button"
                      onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
                      className="text-[9px] font-bold uppercase tracking-wider text-[#2c3b6e] dark:text-white flex items-center gap-1"
                    >
                      {isOrderSummaryExpanded ? "Скрыть товары" : "Показать товары"}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOrderSummaryExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                  
                  {isOrderSummaryExpanded && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 max-h-[240px] overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-10 aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                            <div>
                              <h4 className="text-[10px] font-medium text-[#2c3b6e] dark:text-white leading-snug truncate">{item.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                {item.category && item.category !== item.name && (<span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.category}</span>)}
                                {item.size && (
                                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">/ {item.size}</span>
                                )}
                                {item.color && (
                                  <span className="text-[8px] text-[#2c3b6e] dark:text-white font-medium">/ {item.color}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] mt-1">
                              <span className="text-slate-400 dark:text-slate-500">Кол-во: <span className="font-bold text-[#2c3b6e] dark:text-white">{item.quantity}</span></span>
                              <span className="font-bold text-[#2c3b6e] dark:text-white">{typeof item.price === 'number' ? item.price.toLocaleString() + ' сум' : item.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Итого к оплате:</span>
                    <span className="font-bold text-[#2c3b6e] dark:text-white text-sm">{total.toLocaleString()} сум</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link href="/catalog" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-[#2c3b6e] dark:hover:text-white transition-colors w-fit group">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    Продолжить покупки
                  </Link>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#2c3b6e] dark:text-white mb-2 leading-tight">Оформление заказа</h1>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Укажите контактную информацию и адрес доставки</p>
                  </div>
                </div>

                {/* Authentication Status Alert / Callout */}
                {!isLoggedIn ? (
                  <div className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                    <AlertCircle className="w-5 h-5 text-[#2c3b6e] dark:text-white shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#2c3b6e] dark:text-white">Оформление как гость</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 mb-4">
                        Вы можете продолжить оформление без входа, но авторизованные пользователи могут использовать свои сохраненные адреса.
                      </p>
                      <Link href={`/login?redirect=/checkout`}>
                        <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-[#2c3b6e] dark:text-white hover:underline transition-colors flex items-center gap-1">
                          Войти в аккаунт <ChevronRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2c3b6e] animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                        Авторизован: <span className="text-[#2c3b6e] dark:text-white">{user?.full_name || user?.email}</span>
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user_email");
                        setIsLoggedIn(false);
                        setUser(null);
                        setSavedAddresses([]);
                        window.dispatchEvent(new Event("storage"));
                        window.location.reload();
                      }}
                      className="text-[9px] font-bold uppercase tracking-widest text-[#2c3b6e] dark:text-white hover:underline transition-colors"
                    >
                      Сменить аккаунт
                    </button>
                  </div>
                )}

                {/* Contact Information Fields */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight text-[#2c3b6e] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Контактные данные</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Имя и фамилия *</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Иван Иванов"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none font-medium transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Номер телефона *</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+998 90 123 45 67"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none font-medium transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Email-адрес *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none font-medium transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Addresses Section */}
                <div className="space-y-6 pt-4">
                  <h3 className="text-sm font-black uppercase tracking-tight text-[#2c3b6e] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Адрес доставки</h3>

                  {/* Saved Addresses (Only if logged in and has addresses) */}
                  {isLoggedIn && savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setUseCustomAddress(false);
                            }}
                            className={`border p-4 space-y-2 cursor-pointer transition-all relative rounded-2xl ${
                              selectedAddressId === addr.id && !useCustomAddress
                                ? "border-[#2c3b6e] bg-[#2c3b6e]/[0.02]"
                                : "border-slate-200 dark:border-slate-800 hover:border-[#2c3b6e]/50 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#2c3b6e] dark:text-white">{addr.type}</span>
                              <input 
                                type="radio" 
                                checked={selectedAddressId === addr.id && !useCustomAddress}
                                onChange={() => {}} // Click handles it
                                className="accent-[#2c3b6e] w-3.5 h-3.5"
                              />
                            </div>
                            
                            <div className="space-y-1 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                              <p><span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Регион:</span> {addr.region}</p>
                              <p><span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Адрес:</span> {addr.street}</p>
                              {addr.flat && <p><span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Кв. / Офис:</span> {addr.flat}</p>}
                              {addr.zip && <p><span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Индекс:</span> {addr.zip}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button 
                          type="button"
                          onClick={() => setUseCustomAddress(true)}
                          className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                            useCustomAddress ? "text-[#2c3b6e] dark:text-white underline" : "text-slate-400 dark:text-slate-500 hover:text-[#2c3b6e] dark:text-white"
                          }`}
                        >
                          + Использовать другой адрес
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual Address Input Form (If guest or wants customization) */}
                  {(!isLoggedIn || savedAddresses.length === 0 || useCustomAddress) && (
                    <div className="space-y-6">
                      {isLoggedIn && savedAddresses.length > 0 && (
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Новый адрес доставки</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setUseCustomAddress(false);
                              if (savedAddresses.length > 0) setSelectedAddressId(savedAddresses[0].id);
                            }}
                            className="text-[9px] font-bold uppercase tracking-wider text-[#2c3b6e] dark:text-white hover:underline"
                          >
                            Вернуться к сохраненным
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-1.5 relative">
                          <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Город / Регион *</label>
                          <div className="relative">
                            <select 
                              required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 pr-8 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none cursor-pointer appearance-none transition-colors"
                            >
                              <option value="">Выберите регион</option>
                              {UZBEKISTAN_REGIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#2c3b6e] dark:text-white/50">
                              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Почтовый индекс</label>
                          <input 
                            type="text" 
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="100000"
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none font-medium transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Улица, дом *</label>
                          <input 
                            type="text" 
                            required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="ул. Амира Темура, д. 45"
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none font-medium transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Квартира / Офис</label>
                          <input 
                            type="text" 
                            value={flat}
                            onChange={(e) => setFlat(e.target.value)}
                            placeholder="кв. 12"
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 py-3 text-xs text-[#2c3b6e] dark:text-white focus:border-[#2c3b6e] outline-none font-medium transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                

                {errorMsg && (
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 border border-red-100 p-4">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Right Column: Checkout Sidebar (Products list & Price Totals) */}
              {/* Right Column: Checkout Sidebar (Products list & Price Totals) */}
              <div className="lg:col-span-5 space-y-6 pt-4 lg:pt-0">
                <div>
                  <h3 className="hidden lg:block text-sm font-black uppercase tracking-tight text-[#2c3b6e] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                    Ваш заказ ({items.length})
                  </h3>
                  
                  {/* Table-like Product List */}
                  <div className="hidden lg:block w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-left">Товар</th>
                          <th className="pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center w-16">Кол-во</th>
                          <th className="pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right w-24">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-3 pr-2">
                              <div className="flex gap-3 items-center">
                                <div className="relative w-10 h-10 bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-[10px] font-bold text-[#2c3b6e] dark:text-white leading-snug truncate">{item.name}</h4>
                                  <div className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 space-x-1 flex flex-wrap gap-y-0.5">
                                    {item.category && item.category !== item.name && (<span className="uppercase tracking-widest">{item.category}</span>)}
                                    {item.size && <span>РАЗМЕР: {item.size}</span>}
                                    {item.color && <span>ЦВЕТ: {item.color}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-center align-middle">
                              <span className="text-[10px] font-bold text-[#2c3b6e] dark:text-white">{item.quantity}</span>
                            </td>
                            <td className="py-3 text-right align-middle">
                              <span className="text-[10px] font-bold text-[#2c3b6e] dark:text-white whitespace-nowrap">
                                {typeof item.price === 'number' ? item.price.toLocaleString() + ' сум' : item.price}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Subtotals & Total Summary */}
                <div className="border-y border-slate-100 dark:border-slate-800 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Стоимость товаров</span>
                    <span className="text-[10px] font-bold text-[#2c3b6e] dark:text-white">{total.toLocaleString()} сум</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Доставка</span>
                    <Link href="/delivery" target="_blank" className="text-[10px] font-bold text-[#2c3b6e] dark:text-white hover:text-[#2c3b6e]/80 hover:underline">
                      Условия доставки
                    </Link>
                  </div>
                  
                  <div className="pt-2 flex justify-between items-end">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-white">Итого</span>
                    <span className="text-xl font-black text-[#2c3b6e] dark:text-white uppercase tracking-tighter leading-none">
                      {total.toLocaleString()} сум
                    </span>
                  </div>
                </div>

                {/* Delivery Information Note */}
                <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5 pt-2">
                  <p className="font-bold text-[#2c3b6e] dark:text-white flex items-center gap-1.5 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2c3b6e] animate-pulse" />
                    О доставке
                  </p>
                  <p className="font-medium">
                    После оформления заказа наши сотрудники свяжутся с вами для подтверждения адреса и согласования удобного времени доставки.
                  </p>
                </div>

                {/* Checkout Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#2c3b6e] text-white flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest hover:bg-[#2c3b6e]/90 disabled:bg-slate-300 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Оформление...
                    </>
                  ) : (
                    <>
                      Подтвердить заказ
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      
    </div>
  );
}
