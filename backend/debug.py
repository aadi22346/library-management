import requests

response = requests.get("http://127.0.0.1:5000/api/debug/books")
if response.status_code == 200:
    print("Books fetched successfully:")
    print(response.json())
else:
    print(f"Failed to fetch books. Status code: {response.status_code}")
    print(response.json())
