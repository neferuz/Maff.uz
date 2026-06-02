import pandas as pd

# Load CSV
df_csv = pd.read_csv('/Users/apple/Desktop/Maff.uz-main/products_hierarchy_202604281544.csv', sep=';', dtype=str)
print("CSV Columns:", df_csv.columns.tolist())
print(f"Total rows in CSV: {len(df_csv)}")
print("Sample groups (ЭтоГруппа == 'true' and Уровень == '1'):")
level1_groups = df_csv[(df_csv['ЭтоГруппа'].str.lower() == 'true') & (df_csv['Уровень'] == '1')]
for idx, row in level1_groups.head(10).iterrows():
    print(f"- {row['Наименование']}")

# Load XLS
try:
    df_xls = pd.read_excel('/Users/apple/Desktop/Maff.uz-main/Номенклатуры v2.xls')
    print("\nXLS Columns:", df_xls.columns.tolist())
    print(f"Total rows in XLS: {len(df_xls)}")
    print("XLS Head:")
    print(df_xls.head())
except Exception as e:
    print("Error reading XLS:", e)

