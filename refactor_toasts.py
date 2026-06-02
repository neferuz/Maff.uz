import os
import re

base_dir = "/Users/apple/Desktop/Maff.uz-main/admin-panel/src/app"

def refactor_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original_content = content
    
    # 1. Replace alert(...) with toast(...)
    # Be careful, if it says "Успешно", it should be toast.success
    def repl_alert(m):
        msg = m.group(1)
        if "успешно" in msg.lower():
            return f"toast.success({msg})"
        else:
            return f"toast.error({msg})"
    
    content = re.sub(r'alert\((.*?)\)', repl_alert, content)
    
    # 2. Add toast.error to catch blocks
    # Looking for: catch (error) { ... }
    # Let's just add toast.error("Произошла ошибка"); inside the catch block if it's not already there.
    def repl_catch(m):
        catch_block = m.group(0)
        if "toast.error" not in catch_block:
            # Inject right after `catch (error) {`
            return re.sub(r'catch\s*\((.*?)\)\s*\{', r'catch (\1) {\n      toast.error("Произошла ошибка: " + (\1 instanceof Error ? \1.message : "Неизвестная ошибка"));', catch_block)
        return catch_block

    content = re.sub(r'catch\s*\(.*?\)\s*\{[\s\S]*?\}', repl_catch, content)

    # 3. Replace setShowToast(true) with toast.success
    # Many files have `setShowToast(true); setTimeout(...)`
    # We can replace `setShowToast(true)` with `toast.success("Изменения успешно сохранены")`
    content = re.sub(r'setShowToast\(true\);?', r'toast.success("Изменения успешно сохранены!");', content)
    
    # If we modified the content, ensure react-hot-toast is imported
    if content != original_content and "toast." in content:
        if "react-hot-toast" not in content:
            # Add to top imports
            content = 'import { toast } from "react-hot-toast";\n' + content
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Refactored: {filepath}")

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            refactor_file(os.path.join(root, file))
