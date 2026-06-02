import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    rows = await conn.fetch("SELECT id, name, parent_id, is_active FROM category ORDER BY parent_id NULLS FIRST, name")
    
    cats = {r['id']: dict(r) for r in rows}
    
    # Build tree
    children_map = {}
    for cid, c in cats.items():
        pid = c['parent_id']
        if pid not in children_map:
            children_map[pid] = []
        children_map[pid].append(c)
        
    def build_tree(pid, level=0):
        lines = []
        children = children_map.get(pid, [])
        for child in children:
            status = "" if child['is_active'] else " (Скрыто/Неактивно)"
            indent = "  " * level
            lines.append(f"{indent}- {child['name']}{status} [ID: {child['id']}]")
            lines.extend(build_tree(child['id'], level + 1))
        return lines

    tree_lines = build_tree(None)
    
    print("\nCURRENT CATEGORY ARCHITECTURE ON WEBSITE:\n")
    for line in tree_lines:
        print(line)
        
    await conn.close()

asyncio.run(main())
