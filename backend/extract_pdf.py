import fitz # PyMuPDF
import sys
import io
from PIL import Image

doc = fitz.open("sargo_catalog.pdf")
print(f"Pages: {len(doc)}")

# We just want to find any high-res images from the PDF and maybe save them
for page_num in range(min(15, len(doc))):  # just scan first 15 pages
    page = doc[page_num]
    image_list = page.get_images()
    for img_index, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        if len(image_bytes) > 50000: # larger than 50kb
            print(f"Found image on page {page_num}: {len(image_bytes)} bytes, ext: {image_ext}")
