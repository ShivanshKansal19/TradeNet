from decimal import Decimal
from typing import Dict, Any, List
from .models import Portfolio, PortfolioHolding

def calculate_portfolio_analytics(portfolio: Portfolio) -> Dict[str, Any]:
    """Calculates comprehensive portfolio metrics:
    - Total Invested Amount
    - Current Market Value
    - Total P&L & Return %
    - Sector Allocation breakdown
    - Holding-level P&L details
    """
    holdings = portfolio.holdings.select_related("stock").all()

    total_invested = Decimal("0.00")
    total_current_value = Decimal("0.00")
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

        total_invested += invested
        total_current_value += current_val

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
            "pnl_percent": float(pnl_percent),
        })

    total_pnl = total_current_value - total_invested
    total_return_percent = (
        (total_pnl / total_invested * Decimal("100.0")) if total_invested > 0 else Decimal("0.0")
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

    return {
        "portfolio_id": portfolio.id,
        "portfolio_name": portfolio.name,
        "total_invested": float(total_invested),
        "total_current_value": float(total_current_value),
        "total_pnl": float(total_pnl),
        "total_return_percent": round(float(total_return_percent), 2),
        "holdings_count": len(holding_details),
        "sector_allocations": sector_allocations,
        "holdings": holding_details,
    }
