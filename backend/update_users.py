import re

users_file = "app/api/v1/endpoints/users.py"
with open(users_file, "r") as f:
    content = f.read()

# Currently it creates user and checks if email exists:
# query = select(UserModel).filter(UserModel.email == user_in.email)

new_logic = '''    # Check if user exists by phone or email
    if user_in.phone:
        clean_phone = "".join(filter(str.isdigit, user_in.phone))
        if not clean_phone.startswith("998"):
            clean_phone = "998" + clean_phone[-9:]
        user_in.phone = clean_phone
        query = select(UserModel).filter(UserModel.phone == user_in.phone)
    else:
        query = select(UserModel).filter(UserModel.email == user_in.email)
        
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email or phone already exists in the system.",
        )'''

content = content.replace(
    '''    query = select(UserModel).filter(UserModel.email == user_in.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )''',
    new_logic
)

with open(users_file, "w") as f:
    f.write(content)
print("Updated users.py")
