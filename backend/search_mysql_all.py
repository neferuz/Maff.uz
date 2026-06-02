import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    print("=== GLOBAL SEARCH FOR SILKWOOD / СИЛКВУД IN ALL MYSQL TABLES ===")
    
    # We will query all tables and their text columns for the terms
    cmd_get_tables = "mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -N -e \"SHOW TABLES\""
    tables_proc = subprocess.run(cmd_get_tables, shell=True, capture_output=True, text=True)
    
    if tables_proc.returncode != 0:
        print("Error getting MySQL tables list.")
        return
        
    tables = tables_proc.stdout.strip().split('\n')
    print(f"Found {len(tables)} tables to search.")
    
    keywords = ['Silkwood', 'Силквуд']
    
    for table in tables:
        # Skip search in some huge or irrelevant system/cache tables to keep it extremely fast
        if any(skip in table for skip in ['_cache', '_index', '_stat', '_search', '_session', '_log']):
            continue
            
        # Get columns of the table
        cmd_cols = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -N -e \"SHOW COLUMNS FROM {table}\""
        cols_proc = subprocess.run(cmd_cols, shell=True, capture_output=True, text=True)
        if cols_proc.returncode != 0:
            continue
            
        columns = [line.split('\t')[0] for line in cols_proc.stdout.strip().split('\n') if line]
        
        # Build query for each column
        conditions = []
        for col in columns:
            for kw in keywords:
                conditions.append(f"`{col}` LIKE '%{kw}%'")
                
        if not conditions:
            continue
            
        query = f"SELECT * FROM `{table}` WHERE " + " OR ".join(conditions) + " LIMIT 5"
        
        # Run query and capture output
        cmd_search = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"{query}\""
        search_proc = subprocess.run(cmd_search, shell=True, capture_output=True, text=True)
        
        if search_proc.stdout.strip():
            print(f"\n[MATCH FOUND IN TABLE: {table}]")
            print(search_proc.stdout.strip())

if __name__ == "__main__":
    asyncio.run(main())
