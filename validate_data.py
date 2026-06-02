import pandas as pd

df_csv = pd.read_csv('/Users/apple/Desktop/Maff.uz-main/products_hierarchy_202604281544.csv', sep=';', dtype=str)
products_in_csv = df_csv[df_csv['ЭтоГруппа'].str.lower() == 'false']
print(f"Products in CSV: {len(products_in_csv)}")

df_xls = pd.read_excel('/Users/apple/Desktop/Maff.uz-main/Номенклатуры v2.xls', sheet_name='TDSheet', skiprows=1)
products_in_xls = df_xls.dropna(subset=['Unnamed: 1'])
print(f"Products in XLS: {len(products_in_xls)}")

csv_uuids = set(products_in_csv['uuid'].str.lower())
xls_uuids = set(products_in_xls['Unnamed: 1'].str.lower())
print(f"Products in both: {len(csv_uuids.intersection(xls_uuids))}")
print(f"Products in XLS but not CSV: {len(xls_uuids - csv_uuids)}")
