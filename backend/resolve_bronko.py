import httpx

url = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEBq5ALzRqwhUf-hy1Wm9J43LwSGnt_0o31kacH7wFeeMMuzPlFjsqmvHLn5zwnkrDdECpH10slwWsW8HDHLLuVQEic0jyfDWv6a4cw_d1GdROQLvVjg8in5xHZHfSo4cgS224mUS74qyasEP1J1Q=="
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
