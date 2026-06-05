import re

api_file = "app/api/v1/api.py"
with open(api_file, "r") as f:
    content = f.read()

content = content.replace(
    "from app.api.v1.endpoints import pages, uploads, products, categories, leads, login, users, addresses",
    "from app.api.v1.endpoints import pages, uploads, products, categories, leads, login, users, addresses, auth"
)

with open(api_file, "w") as f:
    f.write(content)
print("Fixed api.py")
