import pandas as pd

def main():
    df = pd.read_csv('/Users/apple/Desktop/Maff.uz-main/products_hierarchy_202604281544.csv', sep=';', dtype=str)
    
    # Check for rows containing "egger" or "eversense" (case insensitive)
    matches = []
    for col in df.columns:
        matching_rows = df[df[col].astype(str).str.contains('egger|eversense', case=False, na=False)]
        if not matching_rows.empty:
            matches.append((col, matching_rows))
            
    print(f"Total matching columns: {len(matches)}")
    seen_uuids = set()
    count = 0
    for col, m_df in matches:
        for idx, row in m_df.iterrows():
            uuid = row.get('uuid')
            if uuid in seen_uuids:
                continue
            seen_uuids.add(uuid)
            count += 1
            print(f"{count}. UUID: {uuid} | Name: {row.get('Номенклатура')} | U1: {row.get('Уровень_1')} | U2: {row.get('Уровень_2')} | U3: {row.get('Уровень_3')}")
            if count >= 30:
                print("Showing first 30 matches...")
                return

if __name__ == '__main__':
    main()
