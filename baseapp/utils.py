import requests
import yfinance as yf
from yahooquery import Ticker
from datetime import datetime
import time
import pandas as pd


def get_trending_stocks():
    url = "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives_in&start=0&count=25"
    headers = {"User-Agent": "Mozilla/5.0"}

    start_time = time.time()
    response = requests.get(url, headers=headers)
    end_time = time.time()
    print(
        f"Time taken to fetch trending stocks: {end_time - start_time} seconds")

    data = response.json()
    result = []
    ticker_list = []
    for item in data["finance"]["result"][0]["quotes"]:
        tk = item["symbol"]
        if '.BO' in tk:
            continue
        ticker_list.append(tk)
    try:
        start_time = time.time()
        tickers = Ticker(' '.join(ticker_list)).price
        end_time = time.time()
        print(
            f"Time taken to fetch stock data for tickers: {end_time - start_time} seconds")
    except Exception as e:
        return e
    for ticker in ticker_list:
        start_time = time.time()
        stock = tickers[ticker]
        result.append({
            "ticker": ticker.replace('.NS', ''),
            "name": stock['longName'] if 'longName' in stock else stock['shortName'] if 'shortName' in stock else 'Not Available',
            "price": stock['regularMarketPrice'],
            "change": str(stock['regularMarketChangePercent']) if stock['regularMarketChangePercent'] < 0 else '+'+str(stock['regularMarketChangePercent']),
            "volume": stock['regularMarketVolume'],
            "timestamp": stock['regularMarketTime'],
        })
        end_time = time.time()
        print(
            f"Time taken to process data for {ticker}: {end_time - start_time} seconds")
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
        start_time = time.time()
        ticker = yf.Ticker(symbol)
        stock_data = ticker.history(period='5y')
        end_time = time.time()
        print(
            f"Time taken to fetch historical data for {symbol}: {end_time - start_time} seconds")
        # `stock_data` will contain historical stock data for the last 5 years
        # You can further process or filter this data as needed
        return stock_data.to_dict(orient='index')
    except Exception as e:
        return e


def calculate_moving_average(data, window=10):
    return data.rolling(window=window, min_periods=1).mean()
