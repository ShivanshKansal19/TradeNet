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

sector = yf.Sector('financial-services')
print(sector.overview)
