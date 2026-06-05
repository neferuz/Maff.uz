import re

login_file = "app/api/v1/endpoints/login.py"
with open(login_file, "r") as f:
    content = f.read()

# Add logic to login by phone or email
# Currently it does: query = select(UserModel).filter(UserModel.email == form_data.username)
new_query_logic = '''    username = form_data.username
    clean_phone = "".join(filter(str.isdigit, username))
    if clean_phone.startswith("998"):
        # Login by phone
        query = select(UserModel).filter(UserModel.phone == clean_phone)
    else:
        # Login by email
        query = select(UserModel).filter(UserModel.email == username)'''

content = content.replace(
    "    query = select(UserModel).filter(UserModel.email == form_data.username)",
    new_query_logic
)

with open(login_file, "w") as f:
    f.write(content)
print("Updated login logic")
