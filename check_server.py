import requests
import sys

def check(url):
    try:
        print(f"Checking {url}...", end=" ")
        resp = requests.get(url, timeout=2)
        print(f"SUCCESS: {resp.status_code}")
        print(resp.text[:100])
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

print("--- DIAGNOSTICS ---")
s1 = check("http://127.0.0.1:8000/")
s2 = check("http://127.0.0.1:8001/")
s3 = check("http://localhost:8001/")

if s2:
    print("\nPort 8001 is ALIVE. Suggest updating frontend to use http://127.0.0.1:8001")
else:
    print("\nPort 8001 is DEAD. Backend crashed or not listening.")
