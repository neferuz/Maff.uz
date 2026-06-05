import re

# 1. Read old product page
with open("scratch/old_product_page.tsx", "r", encoding="utf-8") as f:
    old_content = f.read()

# 2. Extract old calculator block
# The old block starts at: {/* Calculator */}
# And ends before: {/* Tabs */} or price area. Actually in old_product_page.tsx it starts at:
#                {/* Calculator */}
#                {isDoor ? (
# And ends at:
#                  <div className="flex items-center justify-between">
#                    <span className="text-[10px] ...">{unit === "шт" ? "Количество" : "Площадь"}</span>
# (Wait, let's just use regex or string finding)

start_marker = "{/* Calculator */}"
end_marker = "{/* ── Tabs ── */}"

old_start = old_content.find(start_marker)
old_end = old_content.find(end_marker)

if old_start == -1 or old_end == -1:
    print("Could not find markers in old file")
    exit(1)
    
old_calculator_block = old_content[old_start:old_end]

# 3. Read current product page
with open("frontend/src/app/product/[slug]/product-page-client.tsx", "r", encoding="utf-8") as f:
    current_content = f.read()

new_start_marker = "{/* ── Calculator ── */}"
new_end_marker = "{/* ── Tabs ── */}"

new_start = current_content.find(new_start_marker)
new_end = current_content.find(new_end_marker)

if new_start == -1 or new_end == -1:
    print("Could not find markers in current file")
    exit(1)

# Replace the block
updated_content = current_content[:new_start] + old_calculator_block + current_content[new_end:]

with open("frontend/src/app/product/[slug]/product-page-client.tsx", "w", encoding="utf-8") as f:
    f.write(updated_content)

print("Restored old calculator block!")
