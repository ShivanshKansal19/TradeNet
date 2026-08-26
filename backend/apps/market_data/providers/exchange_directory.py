import io
import logging
import urllib.request
import pandas as pd
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Complete list of Indian Market & Sectoral Indices
ALL_MARKET_INDICES = [
    # Broad Benchmark Indices
    {"symbol": "^NSEI", "name": "NIFTY 50", "category": "Broad Market", "fallback_value": 24820.0},
    {"symbol": "^BSESN", "name": "BSE SENSEX", "category": "Broad Market", "fallback_value": 81350.0},
    {"symbol": "^NSEBANK", "name": "NIFTY BANK", "category": "Sectoral", "fallback_value": 51240.0},
    {"symbol": "^CNXIT", "name": "NIFTY IT", "category": "Sectoral", "fallback_value": 41980.0},
    {"symbol": "^CNXAUTO", "name": "NIFTY AUTO", "category": "Sectoral", "fallback_value": 25600.0},
    {"symbol": "^CNXPHARMA", "name": "NIFTY PHARMA", "category": "Sectoral", "fallback_value": 22450.0},
    {"symbol": "^CNXFMCG", "name": "NIFTY FMCG", "category": "Sectoral", "fallback_value": 61200.0},
    {"symbol": "^CNXMETAL", "name": "NIFTY METAL", "category": "Sectoral", "fallback_value": 9180.0},
    {"symbol": "^CNXREALTY", "name": "NIFTY REALTY", "category": "Sectoral", "fallback_value": 1045.0},
    {"symbol": "^CNXENERGY", "name": "NIFTY ENERGY", "category": "Sectoral", "fallback_value": 39800.0},
    {"symbol": "^CNXINFRA", "name": "NIFTY INFRA", "category": "Sectoral", "fallback_value": 8650.0},
    {"symbol": "^CNXPSE", "name": "NIFTY PSE", "category": "Sectoral", "fallback_value": 9480.0},
    {"symbol": "^CRSLDX", "name": "NIFTY 500", "category": "Broad Market", "fallback_value": 23150.0},
    {"symbol": "^NSEMDCP50", "name": "NIFTY MIDCAP 50", "category": "Broad Market", "fallback_value": 15820.0},
    {"symbol": "^CNXSC", "name": "NIFTY SMALLCAP 100", "category": "Broad Market", "fallback_value": 18450.0},
]

NSE_EQUITIES_URL = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"
NIFTY_TOTAL_MARKET_URL = "https://niftyindices.com/IndexConstituent/ind_niftytotalmarket_list.csv"

class ExchangeDirectoryProvider:
    """Dynamic directory provider that downloads official listed securities from NSE and BSE."""

    @staticmethod
    def fetch_all_nse_equities() -> List[Dict[str, Any]]:
        """Fetches the official master list of all ~2,100+ equities listed on the National Stock Exchange."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        # Try official NSE Equity list first
        try:
            req = urllib.request.Request(NSE_EQUITIES_URL, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read().decode("utf-8")
                df = pd.read_csv(io.StringIO(content))

            # Column names in EQUITY_L.csv: SYMBOL, NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE, MARKET LOT, ISIN NUMBER, FACE VALUE
            df.columns = [col.strip().upper() for col in df.columns]
            results = []
            for _, row in df.iterrows():
                symbol = str(row.get("SYMBOL", "")).strip()
                name = str(row.get("NAME OF COMPANY", "")).strip()
                series = str(row.get("SERIES", "EQ")).strip()
                isin = str(row.get("ISIN NUMBER", "")).strip()

                if symbol and series == "EQ":  # Standard Equity shares
                    results.append({
                        "symbol": symbol,
                        "name": name,
                        "exchange": "NSE",
                        "isin": isin,
                        "is_active": True,
                    })

            logger.info(f"Successfully fetched {len(results)} official active NSE equities.")
            if len(results) > 100:
                return results
        except Exception as e:
            logger.warning(f"Direct NSE EQUITY_L.csv fetch failed ({e}). Trying fallback Nifty Total Market feed...")

        # Fallback to Nifty Total Market / 500 constituent feed
        try:
            req = urllib.request.Request(NIFTY_TOTAL_MARKET_URL, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read().decode("utf-8")
                df = pd.read_csv(io.StringIO(content))

            df.columns = [col.strip().upper() for col in df.columns]
            results = []
            for _, row in df.iterrows():
                symbol = str(row.get("SYMBOL", "")).strip()
                name = str(row.get("COMPANY NAME", "")).strip()
                industry = str(row.get("INDUSTRY", "")).strip()

                if symbol:
                    results.append({
                        "symbol": symbol,
                        "name": name,
                        "sector": industry,
                        "exchange": "NSE",
                        "is_active": True,
                    })
            logger.info(f"Successfully fetched {len(results)} Nifty Total Market equities via fallback.")
            return results
        except Exception as fallback_err:
            logger.error(f"Fallback Nifty Total Market fetch failed: {fallback_err}")
            return []

    @staticmethod
    def get_market_indices() -> List[Dict[str, Any]]:
        """Returns metadata for all major Indian market benchmark and sectoral indices."""
        return ALL_MARKET_INDICES
