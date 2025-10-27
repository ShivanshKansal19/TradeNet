import yfinance as yf
from yfinance import EquityQuery, shared
import time
import pandas as pd
from django.http import Http404


def get_trending_stocks():
    q = EquityQuery('and', [
        EquityQuery('eq', ['region', 'in']),
        EquityQuery('gte', ['intradaymarketcap', 2000000000]),
        EquityQuery('gt', ['dayvolume', 5000000])
    ])

    result = []

    try:
        stock_list = yf.screen(q, sortField='dayvolume')['quotes']
    except Exception as e:
        print(f"Error fetching trending stocks: {e}")
        return []

    for stock in stock_list:
        if '.BO' in stock['symbol']:
            continue
        result.append({
            "ticker": stock['symbol'].replace('.NS', ''),
            "name": stock['longName'] if 'longName' in stock else stock['shortName'] if 'shortName' in stock else 'Not Available',
            "price": stock['regularMarketPrice'],
            "change": str(stock['regularMarketChangePercent']) if stock['regularMarketChangePercent'] < 0 else '+'+str(stock['regularMarketChangePercent']),
            "volume": stock['regularMarketVolume'],
            "timestamp": stock['regularMarketTime'],
        })

    return result


def get_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        stock_info = ticker.info
        return stock_info
    except Exception as e:
        print(f"Error fetching stock data for {symbol}: {e}")
        return None


def get_historical_stock_data(symbol):
    start_time = time.time()
    ticker = yf.Ticker(symbol)
    stock_data = ticker.history(period='5y')
    if symbol in shared._ERRORS:
        raise Http404(f"No historical data found for {symbol}")
    end_time = time.time()
    print(
        f"Time taken to fetch historical data for {symbol}: {end_time - start_time} seconds")
    return stock_data.to_dict(orient='index')


def calculate_moving_average(data, window=10):
    return data.rolling(window=window, min_periods=1).mean()
