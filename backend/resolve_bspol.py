import httpx

url = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGYRBhyg4AnUiVYwvtjQcaNQ-BX88ckft-VHSFSV9WsUFtPxAShqh5TYlz6-fx0pSxEZKnNXRLKwDWe2RCFZLx4p_zSib1UdFQlEtEE4h2E0t2B6BbC2cVleJjsmIQ5gYfe17hOmBlh3rOvAQcj8lIcCnpwOQKLdUbQ-Dk="
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def main():
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, verify=False, timeout=15.0)
        print("Final URL:", r.url)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
