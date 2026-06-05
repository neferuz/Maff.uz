import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update AuthStep type
content = content.replace(
    'type AuthStep = "form" | "info" | "success";',
    'type AuthStep = "form" | "otp" | "info" | "success";'
)

# 2. Add OTP states
content = content.replace(
    '  const [step, setStep] = useState<AuthStep>("form");',
    '''  const [step, setStep] = useState<AuthStep>("form");
  const [otpCode, setOtpCode] = useState(["", "", "", ""]);'''
)

# 3. Update handleCredentialsSubmit
content = content.replace(
    '''    if (mode === "register") {
      // Go to Step 2: Personal Info
      if (method === "phone") {
        setRegisterPhone(inputValue);
      } else {
        setRegisterPhone("+998 ");
      }
      setStep("info");
    }''',
    '''    if (mode === "register") {
      // Go to Step OTP
      if (method === "phone") {
        setRegisterPhone(inputValue);
      } else {
        setRegisterPhone("+998 ");
      }
      setStep("otp");
    }'''
)

# 4. Add handleOtpSubmit and handleOtpChange
otp_logic = '''
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

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.join("").length === 4) {
      setStep("info");
    } else {
      setValidationError("Введите 4-значный код полностью");
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {'''

content = content.replace(
    '  const handleRegistrationSubmit = async (e: React.FormEvent) => {',
    otp_logic
)

# 5. Add OTP JSX block right before info step
otp_jsx = '''
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

            {step === "info" && ('''

content = content.replace(
    '            {step === "info" && (',
    otp_jsx
)

# Fix step instructions in forms
content = content.replace('"Шаг 1 из 2: Учетные данные"', '"Шаг 1 из 3: Учетные данные"')
content = content.replace('"Шаг 2 из 2: Как к вам обращаться?"', '"Шаг 3 из 3: Личные данные"')

with open(file_path, "w") as f:
    f.write(content)
print("Added OTP logic")
