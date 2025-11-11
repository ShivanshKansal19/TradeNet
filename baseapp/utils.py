import yfinance as yf
from yfinance import EquityQuery, shared
import time
import pandas as pd
from django.http import Http404
from .models import Sector


def fetch_sectors_data():
    sectors = Sector.objects.all()
    sectors_data = [{"name": "All Sectors",
                     "market_weight": "100%", "market_cap": "--"}]

    for sector in sectors:
        try:
            sector_data = yf.Sector(sector.sector_name)
            overview = sector_data.overview
            sectors_data.append({
                "name": sector_data.name,
                "market_weight": f"{round(overview['market_weight']*100, 2)}%",
                "market_cap": overview['market_cap'],
            })
        except Exception as e:
            print(f"Error fetching sector data for {sector.sector_name}: {e}")
            continue

    return sectors_data


def get_trending_stocks():
    q = EquityQuery('and', [
        EquityQuery('eq', ['region', 'in']),  # type: ignore
        EquityQuery('gte', ['intradaymarketcap', 2000000000]),  # type: ignore
        EquityQuery('gt', ['dayvolume', 5000000])  # type: ignore
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
        change_percent = stock['regularMarketChangePercent']
        change_str = str(change_percent) if change_percent < 0 else f'+{change_percent}'
        result.append({
            "ticker": stock['symbol'].replace('.NS', ''),
            "name": stock['longName'] if 'longName' in stock else stock['shortName'] if 'shortName' in stock else 'Not Available',
            "price": stock['regularMarketPrice'],
            "change": change_str,
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
