file_path = "backend/app/api/v1/api.py"
with open(file_path, "r") as f:
    content = f.read()

if "bot_users" not in content:
    content = content.replace(
        "from app.api.v1.endpoints import pages, uploads, products, categories, leads, login, users, addresses, auth, auth",
        "from app.api.v1.endpoints import pages, uploads, products, categories, leads, login, users, addresses, auth, bot_users"
    )
    content = content + '\napi_router.include_router(bot_users.router, prefix="/bot-users", tags=["bot_users"])\n'
    with open(file_path, "w") as f:
        f.write(content)

init_path = "backend/app/models/__init__.py"
with open(init_path, "r") as f:
    content2 = f.read()

if "BotUser" not in content2:
    content2 = content2 + '\nfrom .bot_user import BotUser\n'
    with open(init_path, "w") as f:
        f.write(content2)

print("Updated api.py and __init__.py")
