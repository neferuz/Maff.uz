file_path = "app/schemas/user.py"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    "class UserCreate(UserBase):\n    email: str",
    "class UserCreate(UserBase):\n    email: Optional[str] = None"
)

with open(file_path, "w") as f:
    f.write(content)
print("Updated UserCreate")
