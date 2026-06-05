import re

file_path = "app/services/eskiz.py"
with open(file_path, "r") as f:
    content = f.read()

# Replace os.getenv with settings
if "from app.core.config import settings" not in content:
    content = content.replace("import os", "import os\nfrom app.core.config import settings")
    content = content.replace('email = os.getenv("ESKIZ_EMAIL")', 'email = settings.ESKIZ_EMAIL')
    content = content.replace('password = os.getenv("ESKIZ_PASSWORD")', 'password = settings.ESKIZ_PASSWORD')

with open(file_path, "w") as f:
    f.write(content)
print("Fixed eskiz.py to use settings")
