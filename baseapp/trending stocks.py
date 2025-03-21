import requests
import json

url = "https://query1.finance.yahoo.com/v1/finance/trending/US"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers)
data = response.json()

if "finance" in data and "result" in data["finance"]:
    trending_tickers = [item["symbol"]
                        for item in data["finance"]["result"][0]["quotes"]]
    print("Trending Stocks:", trending_tickers)
else:
    print("Failed to fetch trending stocks.")
