import asyncio
import os
import sys
import subprocess

# Ensure backend folder is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    uuids = [
        'bf9a8d89-3c70-11f0-8c43-e749b1bdfc3b',
        '0f028989-617a-11f0-8c52-83eca2bf61c9',
        'e08453cf-1137-11f0-8c3b-ad030985df5e',
        'ecc38edc-3b82-11f0-8c43-e749b1bdfc3b',
        'd40b987e-3c70-11f0-8c43-e749b1bdfc3b',
        '219c1911-3b7f-11f0-8c43-e749b1bdfc3b'
    ]
    print(f"=== SEARCHING BITRIX DB FOR SILKWOOD 1C UUIDS ===")
    
    uuids_str = ", ".join([f"'{u}'" for u in uuids])
    cmd = f"mysql -u bitrix0 -p'-2W)m3-qIayyedwgiiif' sitemanager -B -e \"SELECT ID, NAME, XML_ID, DETAIL_PICTURE, PREVIEW_PICTURE FROM b_iblock_element WHERE XML_ID IN ({uuids_str})\""
    subprocess.run(cmd, shell=True)

if __name__ == "__main__":
    asyncio.run(main())
