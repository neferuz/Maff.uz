import re

user_file = "app/models/user.py"
with open(user_file, "r") as f:
    content = f.read()

if "phone = Column" not in content:
    content = content.replace(
        "email = Column(String, unique=True, index=True, nullable=False)",
        "email = Column(String, unique=True, index=True, nullable=True)\n    phone = Column(String, index=True, nullable=True)"
    )
    # Also I made email nullable=True because user might register via phone only!
    with open(user_file, "w") as f:
        f.write(content)
        
init_file = "app/models/__init__.py"
with open(init_file, "r") as f:
    content = f.read()

if "from .otp import OTP" not in content:
    content += "\nfrom .otp import OTP\n"
    with open(init_file, "w") as f:
        f.write(content)
print("Updated models")
