import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    '''      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@maff.uz";

      const formData = new URLSearchParams();
      formData.append("username", emailToSend);''',
    '''      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@maff.uz";

      const formData = new URLSearchParams();
      // Use clean phone if it's a phone method so backend matches via phone column
      const phoneOrEmail = method === "phone" ? cleanInput.replace(/[^0-9]/g, "") : cleanInput;
      formData.append("username", phoneOrEmail);'''
)

with open(file_path, "w") as f:
    f.write(content)
print("Fixed executeLogin")
