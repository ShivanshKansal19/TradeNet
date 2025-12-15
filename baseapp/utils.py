import yfinance as yf
from yfinance import EquityQuery, shared
import time
import pandas as pd
from django.http import Http404
from .models import Sector


def format_value(input):
    if input is None:
        return "--"
    keys = ['K', 'M', 'B', 'T']

    count = 0
    divised = input

    for _ in range(0, len(keys)):
        divised = divised / 1000
        count = count + 1
        if divised < 1000:
            break

    return "%s%s" % (round(divised, 2), keys[count - 1])


def format_percentage(input):
    if input is None:
        return "--"
    return f"{round(input*100,2)}%"


def format_timestamp(input):
    if input is None:
        return "--"
    return time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(input))


def fetch_sectors_data():
    sectors = Sector.objects.all()
    sectors_data = []
    for sector in sectors:
        try:
            sector_data = yf.Sector(sector.sector_name)
        except Exception as e:
            print(f"Error fetching sector data for {sector.sector_name}: {e}")
            continue
        sectors_data.append({
            "key": sector_data.key,
            "name": sector_data.name,
            "market_weight": format_percentage(sector_data.overview['market_weight']),
            "market_cap": format_value(sector_data.overview['market_cap']),
        })

    return sectors_data


def fetch_sector_top_companies(sector, region):
    q = EquityQuery('and', [
        EquityQuery('is-in', ['sector', sector]),  # type: ignore
        EquityQuery('eq', ['region', region]),  # type: ignore
        EquityQuery('gte', ['intradayprice', 5]),  # type: ignore
    ])

    try:
        company_list = yf.screen(q, sortField='dayvolume')['quotes']
    except Exception as e:
        print(f"Error fetching industry top companies: {e}")
        return []

    return parse_stock_list(company_list)


def fetch_industry_top_companies(industry, region):
    q = EquityQuery('and', [
        EquityQuery('is-in', ['industry', industry]),  # type: ignore
        EquityQuery('eq', ['region', region]),  # type: ignore
        EquityQuery('gte', ['intradayprice', 5]),  # type: ignore
    ])

    try:
        company_list = yf.screen(q, sortField='dayvolume')['quotes']
    except Exception as e:
        print(f"Error fetching industry top companies: {e}")
        return []

    return parse_stock_list(company_list)


def get_trending_stocks():
    q = EquityQuery('and', [
        EquityQuery('eq', ['region', 'in']),  # type: ignore
        EquityQuery('gte', ['intradaymarketcap', 2000000000]),  # type: ignore
        EquityQuery('gt', ['dayvolume', 5000000])  # type: ignore
    ])

    try:
        stock_list = yf.screen(q, sortField='dayvolume')['quotes']
    except Exception as e:
        print(f"Error fetching trending stocks: {e}")
        return []

    return parse_stock_list(stock_list)


def get_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        stock_info = ticker.info
        return stock_info
    except Exception as e:
        print(f"Error fetching stock data for {symbol}: {e}")
        return None


def parse_stock_data(stock_info):
    if not stock_info:
        return None

    parsed_data = {
        "ticker": stock_info['symbol'].replace('.NS', ''),
        "name": stock_info['longName'] if 'longName' in stock_info else stock_info['shortName'] if 'shortName' in stock_info else 'Not Available',
        "price": stock_info['regularMarketPrice'],
        "change": ('' if stock_info['regularMarketChangePercent'] < 0 else '+')+str(round(stock_info['regularMarketChangePercent'], 2))+'%',
        "volume": format_value(stock_info['regularMarketVolume']),
        "timestamp": format_timestamp(stock_info['regularMarketTime']),
    }

    return parsed_data


def parse_stock_list(stock_list):
    result = []
    for stock in stock_list:
        parsed_stock = parse_stock_data(stock)
        if parsed_stock:
            result.append(parsed_stock)
    return result


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
