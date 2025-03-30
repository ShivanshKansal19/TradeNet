from bs4 import BeautifulSoup
import requests
import json
import yfinance as yf
import time
import nsetools as nse

url = "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives_in&start=0&count=25"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers)
data = response.json()

for item in data["finance"]["result"][0]["quotes"]:
    tk = item["symbol"]
    print(tk)
    print([field for field in item if "name" in field.lower()])
