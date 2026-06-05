import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update send OTP in handleCredentialsSubmit
content = content.replace(
    '''    if (mode === "register") {
      // Go to Step OTP
      if (method === "phone") {
        setRegisterPhone(inputValue);
      } else {
        setRegisterPhone("+998 ");
      }
      setStep("otp");
    }''',
    '''    if (mode === "register") {
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
    }'''
)

# 2. Update handleOtpSubmit to verify via backend
content = content.replace(
    '''  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.join("").length === 4) {
      setStep("info");
    } else {
      setValidationError("Введите 4-значный код полностью");
    }
  };''',
    '''  const handleOtpSubmit = async (e: React.FormEvent) => {
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
  };'''
)

# 3. Update handleRegistrationSubmit to call backend natively
content = content.replace(
    '''    try {
      // Mocking registration for now as requested
      const cleanInput = inputValue.trim();
      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@maff.uz";

      // Just set fake user locally to bypass backend 401s
      localStorage.removeItem("maff_token");
      localStorage.setItem("maff_user", JSON.stringify({
        email: emailToSend,
        name: firstName || "Пользователь",
        isLoggedIn: true
      }));

      // Set global window variable so profile knows it's a mocked session if needed
      window.dispatchEvent(new Event('storage'));

      setStep("success");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err) {
      console.error("Register error:", err);
      setValidationError("Не удалось создать аккаунт. Попробуйте позже.");
    }''',
    '''    try {
      const cleanInput = inputValue.trim();
      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@maff.uz";
      
      const phoneToSend = registerPhone.replace(/[^0-9+]/g, "");
      const fullNameToSend = `${firstName.trim()} ${lastName.trim()}`;

      // Register contact on real backend
      const res = await fetch("/api/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailToSend,
          password: password,
          phone: phoneToSend,
          full_name: fullNameToSend,
          role: "customer"
        }),
      });

      if (res.ok) {
        // Automatically log in
        const formData = new URLSearchParams();
        # In our updated backend we can pass phone OR email as username!
        formData.append("username", phoneToSend || emailToSend);
        formData.append("password", password);

        const loginRes = await fetch("/api/v1/login/access-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (loginRes.ok) {
          const tokenData = await loginRes.json();
          // Profile expects "token" not "maff_token"
          localStorage.setItem("token", tokenData.access_token);
          localStorage.setItem("user_email", emailToSend);
          localStorage.setItem("user_name", fullNameToSend);
          
          setStep("success");
          setTimeout(() => router.push("/profile"), 2000);
        } else {
          setValidationError("Регистрация успешна, но не удалось войти");
        }
      } else {
        const errData = await res.json();
        setValidationError(errData.detail || "Ошибка при создании аккаунта");
      }
    } catch (err) {
      console.error("Register error:", err);
      setValidationError("Не удалось создать аккаунт. Попробуйте позже.");
    }'''
)

with open(file_path, "w") as f:
    f.write(content)
print("Updated frontend")
