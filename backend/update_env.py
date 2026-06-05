import re

env_file = ".env"
try:
    with open(env_file, "r") as f:
        content = f.read()
except FileNotFoundError:
    content = ""

# If empty keys exist, replace them. Otherwise append.
if "ESKIZ_EMAIL=" in content:
    content = re.sub(r"ESKIZ_EMAIL=.*", "ESKIZ_EMAIL=maffbydafnabitrix24@gmail.com", content)
else:
    content += "\nESKIZ_EMAIL=maffbydafnabitrix24@gmail.com"

if "ESKIZ_PASSWORD=" in content:
    content = re.sub(r"ESKIZ_PASSWORD=.*", "ESKIZ_PASSWORD=SOJDtSoALtZIes9LLRYLBYXVP7TbPGkSgfvDPOb3", content)
else:
    content += "\nESKIZ_PASSWORD=SOJDtSoALtZIes9LLRYLBYXVP7TbPGkSgfvDPOb3"

with open(env_file, "w") as f:
    f.write(content)
print("Updated .env")
