from bs4 import BeautifulSoup
import pandas as pd
import requests
import json
import yfinance as yf
from yfinance import EquityQuery
import time
import nsetools as nse
from utils import get_stock_data, get_historical_stock_data
import os
import django
from django.conf import settings

sector = yf.Sector('energy')
print(sector.top_companies)
