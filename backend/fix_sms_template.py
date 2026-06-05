file_path = "app/services/eskiz.py"
with open(file_path, "r") as f:
    content = f.read()

# Replace the message template
content = content.replace(
    'message = f"Ваш код подтверждения для Maff: {code}"',
    'message = f"Ваш код подтверждения: {code}"'
)

with open(file_path, "w") as f:
    f.write(content)
print("Updated SMS template")
