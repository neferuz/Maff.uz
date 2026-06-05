import httpx

url = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFq4NrGdlK6IwgXcR6ZxZ_pMup9_7Kcc4E9D56E1AxlsjOm74gTW_asmD49jVXhU8QuO4U955W2Ms7maV3bJcl-SfBZx2LD1LYDO60XcyNGtkPa8mKdigGGbUK173xyT7vR2WNkt1GDbonokzqCf-ByTaL1MRbwng0bnt3BLKGzvbau2Kignc3LMzs="
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        print("Final URL:", r.url)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
