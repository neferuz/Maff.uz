import re

login_file = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx"
profile_file = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx"

# 1. Restore the token setting in login/page.tsx
with open(login_file, "r") as f:
    login_content = f.read()

login_content = login_content.replace(
    '''      // Just set fake user locally to bypass backend 401s
      localStorage.removeItem("maff_token");
      localStorage.setItem("maff_user", JSON.stringify({
        email: emailToSend,
        name: firstName || "Пользователь",
        isLoggedIn: true
      }));

      // Set global window variable so profile knows it's a mocked session if needed
      window.dispatchEvent(new Event('storage'));''',
    '''      // Just set fake token and redirect to profile immediately
      localStorage.setItem("token", "fake-mock-token-for-now");
      localStorage.setItem("user_email", emailToSend);
      localStorage.setItem("user_name", firstName || "Пользователь");'''
)
with open(login_file, "w") as f:
    f.write(login_content)

# 2. Add bypass in profile/page.tsx
with open(profile_file, "r") as f:
    profile_content = f.read()

bypass_logic = '''      if (token === "fake-mock-token-for-now") {
        const email = localStorage.getItem("user_email") || "user@maff.uz";
        const name = localStorage.getItem("user_name") || "Новый Пользователь";
        const mockUser = {
          id: 999,
          email: email,
          full_name: name,
          phone: "+998 00 000 00 00"
        };
        setUser(mockUser);
        setFullNameInput(mockUser.full_name);
        setPhoneInput(mockUser.phone);
        setOrders([]);
        setLoading(false);
        return;
      }

      try {'''

profile_content = profile_content.replace('      try {', bypass_logic, 1) # Replace only the first occurrence in the useEffect

with open(profile_file, "w") as f:
    f.write(profile_content)

print("Mock bypass added")
