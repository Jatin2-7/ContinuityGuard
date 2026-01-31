import requests
import sys

try:
    print("Checking backend health...")
    response = requests.get("http://localhost:8000/", timeout=2)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 200:
        print("Backend is UP.")
    else:
        print("Backend returned unexpected status.")
except Exception as e:
    print(f"Backend is DOWN or unreachable: {e}")
