file_path = "app/schemas/user.py"
with open(file_path, "r") as f:
    content = f.read()

if "phone: Optional[str] = None" not in content:
    content = content.replace(
        "full_name: Optional[str] = None",
        "full_name: Optional[str] = None\n    phone: Optional[str] = None"
    )
    with open(file_path, "w") as f:
        f.write(content)
print("Updated schemas")
