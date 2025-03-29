import requests
import json
import yfinance as yf
import time

while True:
    stock = yf.Ticker('TSLA').get_info()
    print(stock['regularMarketPrice'])
    time.sleep(5)
