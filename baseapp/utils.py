import requests
import yfinance as yf
from datetime import datetime


def get_trending_stocks():
    print("Fetching trending stocks.")
    url = "https://query1.finance.yahoo.com/v1/finance/trending/US"
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(url, headers=headers)
    data = response.json()
    result = []

    for item in data["finance"]["result"][0]["quotes"]:
        tk = item["symbol"]
        print(tk)
        try:
            ticker = yf.Ticker(tk)
            stock = ticker.info
        except Exception as e:
            print(e)
            continue
        result.append({
            "ticker": stock['symbol'],
            "name": stock['longName'] if 'longName' in stock else stock['shortName'],
            "price": stock['regularMarketPrice'],
            "change": stock['regularMarketChangePercent'],
            "volume": stock['regularMarketVolume'],
            "timestamp": datetime.fromtimestamp(stock['regularMarketTime']),
        })
    return result


def get_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        stock_info = ticker.info
        return stock_info
    except Exception as e:
        return None


def get_historical_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        stock_data = ticker.history(period='5y')
        # `stock_data` will contain historical stock data for the last 5 years
        # You can further process or filter this data as needed
        return stock_data.to_dict(orient='index')
    except Exception as e:
        return None


def calculate_moving_average(data, window=10):
    return data.rolling(window=window, min_periods=1).mean()
