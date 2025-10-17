from bs4 import BeautifulSoup
import requests
import json
import yfinance as yf
import time
import nsetools as nse
from utils import get_stock_data, get_historical_stock_data

print(get_historical_stock_data("AAPL"))
