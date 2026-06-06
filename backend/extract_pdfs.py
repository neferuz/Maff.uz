import os
import fitz  # PyMuPDF

folder = '/Users/apple/Desktop/Maff.uz-main/coswick'
for file in os.listdir(folder):
    if file.endswith('.pdf'):
        path = os.path.join(folder, file)
        doc = fitz.open(path)
        text = doc[0].get_text("text").split('\n')
        # print first 5 lines of text
        print(f"--- {file} ---")
        print("\n".join(text[:10]))

