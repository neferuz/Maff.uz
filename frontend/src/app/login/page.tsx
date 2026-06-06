"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, User } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthMethod = "email" | "phone";
type AuthMode = "login" | "register";
type AuthStep = "form" | "otp" | "info" | "success";

export default function AuthPage() {
  const [method, setMethod] = useState<AuthMethod>("phone");
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<AuthStep>("form");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);
  const [inputValue, setInputValue] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("+998 ");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper validations
  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isPhoneValid = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    return clean.length === 12 && clean.startsWith("998");
  };

  const isStep1Valid = () => {
    const val = inputValue.trim();
    if (!val) return false;
    
    if (method === "email") {
      if (!isEmailValid(val)) return false;
    } else {
      if (!isPhoneValid(val)) return false;
    }

    if (!password || password.length < 8) return false;

    if (mode === "register") {
      if (password !== confirmPassword) return false;
    }

    return true;
  };

  const isStep2Valid = () => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!isPhoneValid(registerPhone)) return false;
    return true;
  };

  // Phone input formatting masks (+998 XX XXX XX XX)
  const handlePhoneInputChange = (val: string) => {
    setValidationError("");
    if (!val.startsWith("+998")) {
      setInputValue("+998 ");
      return;
    }
    const digitsAfterCode = val.slice(5).replace(/[^0-9]/g, "");
    if (digitsAfterCode.length > 9) return;
    
    let formatted = "+998 ";
    if (digitsAfterCode.length > 0) {
      formatted += digitsAfterCode.slice(0, 2);
    }
    if (digitsAfterCode.length > 2) {
      formatted += " " + digitsAfterCode.slice(2, 5);
    }
    if (digitsAfterCode.length > 5) {
      formatted += " " + digitsAfterCode.slice(5, 7);
    }
    if (digitsAfterCode.length > 7) {
      formatted += " " + digitsAfterCode.slice(7, 9);
    }
    setInputValue(formatted);
  };

  const handleRegisterPhoneChange = (val: string) => {
    setValidationError("");
    if (!val.startsWith("+998")) {
      setRegisterPhone("+998 ");
      return;
    }
    const digitsAfterCode = val.slice(5).replace(/[^0-9]/g, "");
    if (digitsAfterCode.length > 9) return;
    
    let formatted = "+998 ";
    if (digitsAfterCode.length > 0) {
      formatted += digitsAfterCode.slice(0, 2);
    }
    if (digitsAfterCode.length > 2) {
      formatted += " " + digitsAfterCode.slice(2, 5);
    }
    if (digitsAfterCode.length > 5) {
      formatted += " " + digitsAfterCode.slice(5, 7);
    }
    if (digitsAfterCode.length > 7) {
      formatted += " " + digitsAfterCode.slice(7, 9);
    }
    setRegisterPhone(formatted);
  };

  const handleInputChange = (val: string) => {
    setValidationError("");
    if (method === "phone") {
      handlePhoneInputChange(val);
    } else {
      setInputValue(val);
    }
  };

  // Redirect to profile immediately if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/profile");
    }
  }, [router]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!isStep1Valid()) {
      return;
    }

    if (mode === "register") {
      setLoading(true);
      const cleanPhone = inputValue.replace(/[^0-9+]/g, "");
      fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone })
      }).then(() => {
        setLoading(false);
        if (method === "phone") {
          setRegisterPhone(inputValue);
        } else {
          setRegisterPhone("+998 ");
        }
        setStep("otp");
      }).catch(err => {
        console.error("Failed to send OTP", err);
        setLoading(false);
        setValidationError("Не удалось отправить код SMS");
      });
    } else {
      // Direct login
      executeLogin();
    }
  };

  const executeLogin = async () => {
    setLoading(true);
    setValidationError("");

    try {
      const cleanInput = inputValue.trim();
      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@maff.uz";

      const formData = new URLSearchParams();
      // Use clean phone if it's a phone method so backend matches via phone column
      const phoneOrEmail = method === "phone" ? cleanInput.replace(/[^0-9]/g, "") : cleanInput;
      formData.append("username", phoneOrEmail);
      formData.append("password", password);

      const res = await fetch("/api/v1/login/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_email", emailToSend);
        
        setStep("success");
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        const errData = await res.json();
        setValidationError(errData.detail || "Неверный логин или пароль");
      }
    } catch (err) {
      console.error("Login error:", err);
      setValidationError("Не удалось связаться с сервером. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };


  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.join("").length === 4) {
      setLoading(true);
      const cleanPhone = inputValue.replace(/[^0-9+]/g, "");
      try {
        const res = await fetch("/api/v1/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone, code: otpCode.join("") })
        });
        if (res.ok) {
          setStep("info");
        } else {
          setValidationError("Неверный код");
        }
      } catch (err) {
        setValidationError("Ошибка проверки кода");
      } finally {
        setLoading(false);
      }
    } else {
      setValidationError("Введите 4-значный код полностью");
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!isStep2Valid()) {
      return;
    }

    setLoading(true);

    try {
      const cleanInput = inputValue.trim();
      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@maff.uz";

      const res = await fetch("/api/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanInput.replace(/[^0-9]/g, ""),
          email: emailToSend,
          password: password,
          full_name: `${firstName} ${lastName}`.trim(),
        }),
      });

      if (res.ok) {
        // Automatically login
        await executeLogin();
      } else {
        const errData = await res.json();
        setValidationError(errData.detail || "Не удалось создать аккаунт. Возможно, пользователь уже существует.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setValidationError("Не удалось создать аккаунт. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col justify-between">
      
      
      <main className="pt-10 md:pt-16 pb-12 relative overflow-hidden flex-1">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-md relative z-10 w-full">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-[#2c3b6e] uppercase mb-3">
                    {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
                  </h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {mode === "login" ? "Введите свои данные для входа" : "Шаг 1 из 3: Учетные данные"}
                  </p>
                </div>

                <div className="flex border-b border-slate-100">
                  <button 
                    type="button"
                    onClick={() => { setMode("login"); setValidationError(""); }}
                    className={`flex-1 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === "login" ? "text-[#2c3b6e] border-b-2 border-[#2c3b6e]" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Вход
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setMode("register"); setValidationError(""); }}
                    className={`flex-1 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === "register" ? "text-[#2c3b6e] border-b-2 border-[#2c3b6e]" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Регистрация
                  </button>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                  {/* Phone Input */}
                  <div>
                    <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                      <Phone className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                    </div>
                    {inputValue.replace(/[^0-9]/g, "").length > 3 && !isPhoneValid(inputValue) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {inputValue.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                      <Lock className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setValidationError(""); }}
                        placeholder={mode === "login" ? "ВВЕДИТЕ ПАРОЛЬ" : "ПРИДУМАЙТЕ ПАРОЛЬ"}
                        className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:text-[#2c3b6e] text-slate-300 transition-colors ml-2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && password.length < 8 && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Пароль должен содержать не менее 8 символов (введено: {password.length})
                      </p>
                    )}
                  </div>

                  {/* Confirm Password (Register mode only) */}
                  {mode === "register" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                        <Lock className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(""); }}
                          placeholder="ПОДТВЕРДИТЕ ПАРОЛЬ"
                          className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="p-1 hover:text-[#2c3b6e] text-slate-300 transition-colors ml-2"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                          Пароли не совпадают
                        </p>
                      )}
                    </motion.div>
                  )}

                  {validationError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{validationError}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={loading || !isStep1Valid()}
                    className="w-full h-12 rounded-full flex items-center justify-center bg-[#2c3b6e] text-white uppercase tracking-widest font-bold text-[10px] md:text-xs shadow-sm hover:bg-[#2c3b6e]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Продолжить"}
                  </button>
                </form>
              </motion.div>
            )}


            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-[#2c3b6e] uppercase mb-3">Подтверждение</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Мы отправили код на {inputValue}</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-center gap-4">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[index]}
                        onChange={(e) => { handleOtpChange(index, e.target.value); setValidationError(""); }}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-16 text-center text-2xl font-black text-[#2c3b6e] bg-slate-50 border-b-2 border-slate-200 focus:outline-none focus:border-[#2c3b6e] focus:bg-slate-100 rounded-t-xl transition-all"
                      />
                    ))}
                  </div>

                  {validationError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{validationError}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={otpCode.join("").length !== 4}
                    className="w-full h-12 rounded-full flex items-center justify-center bg-[#2c3b6e] text-white uppercase tracking-widest font-bold text-[10px] md:text-xs shadow-sm hover:bg-[#2c3b6e]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Подтвердить код
                  </button>
                  
                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={() => setStep("form")}
                      className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#2c3b6e] transition-colors underline underline-offset-4"
                    >
                      Изменить номер
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-[#2c3b6e] uppercase mb-3">Личные данные</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Шаг 2 из 2: Как к вам обращаться?</p>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                  {/* First Name */}
                  <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                    <User className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                    <input 
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setValidationError(""); }}
                      placeholder="ИМЯ"
                      className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex items-center border-b border-slate-200 py-3 focus-within:border-[#2c3b6e] transition-colors">
                    <User className="w-4 h-4 text-slate-300 mr-3 flex-shrink-0" />
                    <input 
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setValidationError(""); }}
                      placeholder="ФАМИЛИЯ"
                      className="w-full bg-transparent text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={registerPhone}
                      onChange={(e) => handleRegisterPhoneChange(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-[#2c3b6e] tracking-normal focus:outline-none focus:border-[#2c3b6e] transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    {registerPhone && registerPhone.trim() !== "+998" && !isPhoneValid(registerPhone) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {registerPhone.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>

                  {validationError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{validationError}</p>
                  )}

                  <div className="space-y-3 pt-2">
                    <button 
                      type="submit"
                      disabled={loading || !isStep2Valid()}
                      className="w-full h-12 rounded-full flex items-center justify-center bg-[#2c3b6e] text-white uppercase tracking-widest font-bold text-[10px] md:text-xs shadow-sm hover:bg-[#2c3b6e]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? "Создание аккаунта..." : "Завершить регистрацию"}
                    </button>
                    
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={() => { setStep("form"); setValidationError(""); }}
                        className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#2c3b6e] transition-colors underline underline-offset-4"
                      >
                        Вернуться к учетным данным
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-[#2c3b6e] uppercase">
                    {mode === "login" ? "Успешный вход" : "Регистрация завершена"}
                  </h2>
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">
                    Добро пожаловать в Maff.uz
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      
    </div>
  );
}
