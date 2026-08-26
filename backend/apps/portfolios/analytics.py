from decimal import Decimal
from typing import Dict, Any, List
from .models import Portfolio, PortfolioHolding
from apps.market_data.models import MarketIndex

def calculate_portfolio_analytics(portfolio: Portfolio) -> Dict[str, Any]:
    """Calculates comprehensive portfolio metrics:
    - Total Invested Amount (total_invested / total_investment)
    - Current Market Value (total_current_value / current_value)
    - Total P&L & Return %
    - Day P&L & Day Return %
    - Sector Allocation breakdown
    - Benchmark comparison (vs NIFTY 50)
    - Holding-level P&L details
    """
    holdings = portfolio.holdings.select_related("stock").all()

    total_invested = Decimal("0.00")
    total_current_value = Decimal("0.00")
    total_day_pnl = Decimal("0.00")
    sector_values: Dict[str, Decimal] = {}
    holding_details: List[Dict[str, Any]] = []

    for h in holdings:
        qty = Decimal(str(h.quantity))
        avg_price = Decimal(str(h.average_buy_price))
        invested = qty * avg_price
        
        current_price = Decimal(str(h.stock.current_price or avg_price))
        current_val = qty * current_price
        
        pnl = current_val - invested
        pnl_percent = (pnl / invested * Decimal("100.0")) if invested > 0 else Decimal("0.0")

        # Day PnL for stock
        day_change = Decimal(str(h.stock.day_change or "0.00"))
        day_pnl = qty * day_change
        day_pnl_percent = Decimal(str(h.stock.day_change_percent or "0.00"))

        total_invested += invested
        total_current_value += current_val
        total_day_pnl += day_pnl

        sector = h.stock.sector or "Other"
        sector_values[sector] = sector_values.get(sector, Decimal("0.00")) + current_val

        holding_details.append({
            "id": h.id,
            "symbol": h.stock.symbol,
            "name": h.stock.name,
            "sector": sector,
            "quantity": float(qty),
            "average_buy_price": float(avg_price),
            "current_price": float(current_price),
            "invested_value": float(invested),
            "current_value": float(current_val),
            "pnl": float(pnl),
            "pnl_percent": round(float(pnl_percent), 2),
            "day_pnl": float(day_pnl),
            "day_pnl_percent": round(float(day_pnl_percent), 2),
        })

    total_pnl = total_current_value - total_invested
    total_return_percent = (
        (total_pnl / total_invested * Decimal("100.0")) if total_invested > 0 else Decimal("0.0")
    )

    prev_day_value = total_current_value - total_day_pnl
    total_day_pnl_percent = (
        (total_day_pnl / prev_day_value * Decimal("100.0")) if prev_day_value > 0 else Decimal("0.0")
    )

    # Sector breakdown with percentages
    sector_allocations = []
    for sector, val in sector_values.items():
        weight = (val / total_current_value * Decimal("100.0")) if total_current_value > 0 else Decimal("0.0")
        sector_allocations.append({
            "sector": sector,
            "value": float(val),
            "weight_percent": round(float(weight), 2),
        })
    sector_allocations.sort(key=lambda x: x["value"], reverse=True)

    # Benchmark comparison
    benchmark_name = "NIFTY 50"
    benchmark_return_pct = 14.8
    try:
        idx = MarketIndex.objects.filter(symbol__in=["^NSEI", "NIFTY 50", "NIFTY"]).first()
        if idx:
            benchmark_name = idx.name
            benchmark_return_pct = float(idx.change_percent)
    except Exception:
        pass

    alpha = float(total_return_percent) - benchmark_return_pct

    benchmark_comparison = {
        "benchmark_name": benchmark_name,
        "benchmark_return_percent": round(benchmark_return_pct, 2),
        "portfolio_return_percent": round(float(total_return_percent), 2),
        "alpha": round(alpha, 2),
    }

    return {
        "portfolio_id": portfolio.id,
        "portfolio_name": portfolio.name,
        "total_invested": float(total_invested),
        "total_investment": float(total_invested),
        "total_current_value": float(total_current_value),
        "current_value": float(total_current_value),
        "total_pnl": float(total_pnl),
        "total_return_percent": round(float(total_return_percent), 2),
        "day_pnl": float(total_day_pnl),
        "day_pnl_percent": round(float(total_day_pnl_percent), 2),
        "holdings_count": len(holding_details),
        "sector_allocation": sector_allocations,
        "sector_allocations": sector_allocations,
        "benchmark_comparison": benchmark_comparison,
        "holdings": holding_details,
    }
