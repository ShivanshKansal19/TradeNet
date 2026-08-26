from decimal import Decimal
from datetime import datetime, timedelta
import random

TOP_INDIAN_STOCKS = [
    {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Limited",
        "sector": "Energy",
        "industry": "Oil & Gas Refining & Marketing",
        "market_cap": 2015000000000.0,
        "current_price": Decimal("2950.50"),
        "day_change": Decimal("18.75"),
        "day_change_percent": Decimal("0.64"),
        "fundamentals": {
            "pe_ratio": Decimal("28.40"),
            "pb_ratio": Decimal("2.45"),
            "eps": Decimal("103.88"),
            "roe": Decimal("0.0920"),
            "debt_to_equity": Decimal("0.42"),
            "dividend_yield": Decimal("0.0035"),
            "book_value": Decimal("1204.30"),
            "week_52_high": Decimal("3024.90"),
            "week_52_low": Decimal("2220.30"),
        },
    },
    {
        "symbol": "TCS",
        "name": "Tata Consultancy Services Limited",
        "sector": "Technology",
        "industry": "Information Technology Services",
        "market_cap": 1420000000000.0,
        "current_price": Decimal("4185.00"),
        "day_change": Decimal("-24.50"),
        "day_change_percent": Decimal("-0.58"),
        "fundamentals": {
            "pe_ratio": Decimal("31.20"),
            "pb_ratio": Decimal("14.80"),
            "eps": Decimal("134.10"),
            "roe": Decimal("0.4850"),
            "debt_to_equity": Decimal("0.00"),
            "dividend_yield": Decimal("0.0135"),
            "book_value": Decimal("282.70"),
            "week_52_high": Decimal("4590.00"),
            "week_52_low": Decimal("3310.00"),
        },
    },
    {
        "symbol": "HDFCBANK",
        "name": "HDFC Bank Limited",
        "sector": "Financial Services",
        "industry": "Private Sector Banking",
        "market_cap": 1280000000000.0,
        "current_price": Decimal("1645.25"),
        "day_change": Decimal("12.10"),
        "day_change_percent": Decimal("0.74"),
        "fundamentals": {
            "pe_ratio": Decimal("18.90"),
            "pb_ratio": Decimal("2.85"),
            "eps": Decimal("87.05"),
            "roe": Decimal("0.1650"),
            "debt_to_equity": Decimal("1.10"),
            "dividend_yield": Decimal("0.0118"),
            "book_value": Decimal("577.20"),
            "week_52_high": Decimal("1794.00"),
            "week_52_low": Decimal("1363.55"),
        },
    },
    {
        "symbol": "INFY",
        "name": "Infosys Limited",
        "sector": "Technology",
        "industry": "Information Technology Services",
        "market_cap": 780000000000.0,
        "current_price": Decimal("1880.60"),
        "day_change": Decimal("32.40"),
        "day_change_percent": Decimal("1.75"),
        "fundamentals": {
            "pe_ratio": Decimal("29.50"),
            "pb_ratio": Decimal("8.60"),
            "eps": Decimal("63.75"),
            "roe": Decimal("0.3120"),
            "debt_to_equity": Decimal("0.09"),
            "dividend_yield": Decimal("0.0245"),
            "book_value": Decimal("218.60"),
            "week_52_high": Decimal("1991.45"),
            "week_52_low": Decimal("1358.35"),
        },
    },
    {
        "symbol": "ICICIBANK",
        "name": "ICICI Bank Limited",
        "sector": "Financial Services",
        "industry": "Private Sector Banking",
        "market_cap": 870000000000.0,
        "current_price": Decimal("1225.40"),
        "day_change": Decimal("8.30"),
        "day_change_percent": Decimal("0.68"),
        "fundamentals": {
            "pe_ratio": Decimal("18.40"),
            "pb_ratio": Decimal("3.20"),
            "eps": Decimal("66.60"),
            "roe": Decimal("0.1880"),
            "debt_to_equity": Decimal("0.95"),
            "dividend_yield": Decimal("0.0082"),
            "book_value": Decimal("382.90"),
            "week_52_high": Decimal("1300.00"),
            "week_52_low": Decimal("930.00"),
        },
    },
    {
        "symbol": "TATAMOTORS",
        "name": "Tata Motors Limited",
        "sector": "Automobile",
        "industry": "Automobiles - Passenger & Commercial",
        "market_cap": 380000000000.0,
        "current_price": Decimal("1040.80"),
        "day_change": Decimal("-11.20"),
        "day_change_percent": Decimal("-1.06"),
        "fundamentals": {
            "pe_ratio": Decimal("11.80"),
            "pb_ratio": Decimal("4.10"),
            "eps": Decimal("88.20"),
            "roe": Decimal("0.3850"),
            "debt_to_equity": Decimal("0.65"),
            "dividend_yield": Decimal("0.0058"),
            "book_value": Decimal("253.80"),
            "week_52_high": Decimal("1179.00"),
            "week_52_low": Decimal("593.50"),
        },
    },
    {
        "symbol": "BHARTIARTL",
        "name": "Bharti Airtel Limited",
        "sector": "Telecommunication",
        "industry": "Telecom - Services",
        "market_cap": 910000000000.0,
        "current_price": Decimal("1580.00"),
        "day_change": Decimal("15.50"),
        "day_change_percent": Decimal("0.99"),
        "fundamentals": {
            "pe_ratio": Decimal("68.40"),
            "pb_ratio": Decimal("9.20"),
            "eps": Decimal("23.10"),
            "roe": Decimal("0.1420"),
            "debt_to_equity": Decimal("1.80"),
            "dividend_yield": Decimal("0.0050"),
            "book_value": Decimal("171.70"),
            "week_52_high": Decimal("1670.00"),
            "week_52_low": Decimal("845.00"),
        },
    },
    {
        "symbol": "ITC",
        "name": "ITC Limited",
        "sector": "Consumer Goods",
        "industry": "FMCG - Cigarettes & Tobacco",
        "market_cap": 620000000000.0,
        "current_price": Decimal("495.30"),
        "day_change": Decimal("2.10"),
        "day_change_percent": Decimal("0.43"),
        "fundamentals": {
            "pe_ratio": Decimal("29.80"),
            "pb_ratio": Decimal("8.40"),
            "eps": Decimal("16.62"),
            "roe": Decimal("0.2940"),
            "debt_to_equity": Decimal("0.00"),
            "dividend_yield": Decimal("0.0275"),
            "book_value": Decimal("58.90"),
            "week_52_high": Decimal("520.00"),
            "week_52_low": Decimal("399.30"),
        },
    },
]

MARKET_INDICES_SEED = [
    {
        "symbol": "^NSEI",
        "name": "NIFTY 50",
        "value": Decimal("24980.50"),
        "change": Decimal("128.40"),
        "change_percent": Decimal("0.52"),
    },
    {
        "symbol": "^NSEBANK",
        "name": "NIFTY BANK",
        "value": Decimal("51420.25"),
        "change": Decimal("310.80"),
        "change_percent": Decimal("0.61"),
    },
    {
        "symbol": "^CNXIT",
        "name": "NIFTY IT",
        "value": Decimal("42110.00"),
        "change": Decimal("-180.50"),
        "change_percent": Decimal("-0.43"),
    },
    {
        "symbol": "^CNXAUTO",
        "name": "NIFTY AUTO",
        "value": Decimal("25640.75"),
        "change": Decimal("95.20"),
        "change_percent": Decimal("0.37"),
    },
]

SECTORS_SEED = [
    {
        "sector_name": "Financial Services",
        "change_percent": Decimal("0.68"),
        "top_gainer": "HDFCBANK",
        "top_loser": "AXISBANK",
        "market_cap": 2500000000000.0,
    },
    {
        "sector_name": "Technology",
        "change_percent": Decimal("0.58"),
        "top_gainer": "INFY",
        "top_loser": "TCS",
        "market_cap": 1800000000000.0,
    },
    {
        "sector_name": "Energy",
        "change_percent": Decimal("0.64"),
        "top_gainer": "RELIANCE",
        "top_loser": "ONGC",
        "market_cap": 1900000000000.0,
    },
    {
        "sector_name": "Automobile",
        "change_percent": Decimal("-0.35"),
        "top_gainer": "M&M",
        "top_loser": "TATAMOTORS",
        "market_cap": 900000000000.0,
    },
    {
        "sector_name": "Consumer Goods",
        "change_percent": Decimal("0.43"),
        "top_gainer": "ITC",
        "top_loser": "HINDUNILVR",
        "market_cap": 1200000000000.0,
    },
    {
        "sector_name": "Telecommunication",
        "change_percent": Decimal("0.99"),
        "top_gainer": "BHARTIARTL",
        "top_loser": "IDEA",
        "market_cap": 950000000000.0,
    },
]

def generate_synthetic_history(base_price: float, days: int = 250):
    """Generates synthetic historical OHLCV data ending today."""
    records = []
    current_date = datetime.now().date()
    price = base_price * 0.8  # Start 20% lower 250 days ago
    
    dates = []
    dt = current_date - timedelta(days=int(days * 1.5))
    while len(dates) < days:
        if dt.weekday() < 5:  # Monday - Friday
            dates.append(dt)
        dt += timedelta(days=1)

    for d in dates:
        drift = random.uniform(-0.02, 0.025)
        price = max(price * (1 + drift), 10.0)
        daily_vol = random.uniform(0.005, 0.025)
        high = price * (1 + daily_vol)
        low = price * (1 - daily_vol)
        open_p = random.uniform(low, high)
        close_p = price
        volume = int(random.uniform(500000, 5000000))
        records.append({
            "date": d,
            "open_price": Decimal(f"{open_p:.2f}"),
            "high_price": Decimal(f"{high:.2f}"),
            "low_price": Decimal(f"{low:.2f}"),
            "close_price": Decimal(f"{close_p:.2f}"),
            "volume": volume,
            "adjusted_close": Decimal(f"{close_p:.2f}"),
        })
    return records
