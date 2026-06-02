import pandas as pd

try:
    xls = pd.ExcelFile('/Users/apple/Desktop/Maff.uz-main/Номенклатуры v2.xls')
    print("Sheets in XLS:", xls.sheet_names)
    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet)
        print(f"\nSheet '{sheet}' - Columns:", df.columns.tolist())
        print(f"Total rows: {len(df)}")
        if len(df) > 0:
            print(df.head(2))
except Exception as e:
    print("Error:", e)

