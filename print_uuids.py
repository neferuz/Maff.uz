import pandas as pd
df_csv = pd.read_csv('/Users/apple/Desktop/Maff.uz-main/products_hierarchy_202604281544.csv', sep=';', dtype=str)
print("CSV uuids:")
print(df_csv[df_csv['ЭтоГруппа'].str.lower() == 'false']['uuid'].head(5).tolist())

df_xls = pd.read_excel('/Users/apple/Desktop/Maff.uz-main/Номенклатуры v2.xls', sheet_name='TDSheet', skiprows=1)
print("\nXLS uuids:")
print(df_xls['Unnamed: 1'].dropna().head(5).tolist())
