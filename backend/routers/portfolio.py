from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Holding, PortfolioSnapshot
from schemas import PortfolioSummary, SnapshotOut
from services import get_cash_balance, get_last_daily_close_price

router = APIRouter()


@router.get("/summary", response_model=PortfolioSummary)
def summary(db: Session = Depends(get_db)):
    cash_balance = get_cash_balance(db)
    holdings = db.query(Holding).filter(Holding.shares > 0).all()

    holdings_out = []
    total_invested_value = 0.0
    total_unrealized_gain = 0.0
    total_cost_basis_value = 0.0

    for h in holdings:
        current_price = get_last_daily_close_price(h.ticker)
        if current_price is None:
            continue

        current_value = h.shares * current_price
        cost_basis_value = h.shares * h.avg_cost_basis
        unrealized_gain = current_value - cost_basis_value
        unrealized_gain_pct = (unrealized_gain / cost_basis_value) if cost_basis_value > 0 else 0.0

        total_invested_value += current_value
        total_unrealized_gain += unrealized_gain
        total_cost_basis_value += cost_basis_value

        holdings_out.append(
            {
                "id": h.id,
                "ticker": h.ticker,
                "shares": h.shares,
                "avg_cost_basis": h.avg_cost_basis,
                "current_price": current_price,
                "current_value": current_value,
                "unrealized_gain": unrealized_gain,
                "unrealized_gain_pct": unrealized_gain_pct,
            }
        )

    total_value = cash_balance + total_invested_value
    total_unrealized_gain_pct = (
        total_unrealized_gain / total_cost_basis_value if total_cost_basis_value > 0 else 0.0
    )

    return {
        "cash_balance": cash_balance,
        "total_invested_value": total_invested_value,
        "total_value": total_value,
        "total_unrealized_gain": total_unrealized_gain,
        "total_unrealized_gain_pct": total_unrealized_gain_pct,
        "holdings": holdings_out,
    }


@router.get("/history", response_model=list[SnapshotOut])
def history(db: Session = Depends(get_db)):
    snaps = db.query(PortfolioSnapshot).order_by(PortfolioSnapshot.date.asc()).all()
    return [
        SnapshotOut(
            date=s.date,
            total_value=s.total_value,
            cash_balance=s.cash_balance,
            invested_value=s.invested_value,
        )
        for s in snaps
    ]
