from bs4 import BeautifulSoup
import pandas as pd
import requests
import json
import yfinance as yf
from yfinance import EquityQuery
import time
import nsetools as nse
import os
import django
from django.conf import settings

# sector = yf.Sector('technology')
# print(sector.)

# industry = yf.Industry('semiconductors')
# print(industry.top_performing_companies)

q = EquityQuery('and', [
    EquityQuery('is-in', ['sector', 'Technology']),  # type: ignore
    EquityQuery(
        'is-in', ['industry', 'Software Infrastructure']),  # type: ignore
    # EquityQuery('eq', ['region', 'in']),  # type: ignore
    # EquityQuery('gte', ['intradayprice', 5]),  # type: ignore
])

# top_companies_query = yf.EquityQuery(
#     region="US",
#     sector="Technology",
#     # Further filters for market cap can be added
# )
# result = top_companies_query.screen()
# print(result)
print(yf.screen(q, sortField='dayvolume')['quotes'])
