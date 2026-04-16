from models import Transaction, Holding, PortfolioSnapshot
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, date
import yfinance as yf

STARTING_CASH = 100000.00

def get_last_daily_close_price(ticker: str) -> float | None:
    """
    MVP "EOD" mark: use the latest available daily close from recent history.

    Note: This is not a perfect exchange official close for an arbitrary historical date.
    For a take-home, it's a defensible approximation of "not intraday" charting.
    """
    hist = yf.Ticker(ticker).history(period="30d")
    if hist is None or hist.empty:
        return None
    if "Close" not in hist.columns:
        return None
    last = hist["Close"].dropna().iloc[-1]
    try:
        return float(last)
    except (TypeError, ValueError):
        return None


def get_or_create_holding(db: Session, ticker: str) -> Holding:
    existing_holding = db.query(Holding).filter(Holding.ticker == ticker).first()
    if existing_holding is None:
        new_holding = Holding(ticker=ticker, shares=0, avg_cost_basis=0)
        db.add(new_holding)
        db.flush()
        return new_holding
    
    return existing_holding

def _invested_market_value_eod(db: Session) -> float:
    total = 0.0
    holdings = (
        db.query(Holding)
        .filter(Holding.shares > 0)
        .order_by(Holding.ticker.asc())
        .all()
    )
    for h in holdings:
        px = get_last_daily_close_price(h.ticker)
        if px is None:
            continue
        total += h.shares * px
    return total


def refresh_today_portfolio_snapshot(db: Session) -> PortfolioSnapshot:
    today = date.today()
    cash = get_cash_balance(db)
    invested = _invested_market_value_eod(db)
    total_value = cash + invested

    snap = db.query(PortfolioSnapshot).filter(PortfolioSnapshot.date == today).first()
    if snap is None:
        snap = PortfolioSnapshot(
            date=today,
            total_value=total_value,
            cash_balance=cash,
            invested_value=invested,
        )
        db.add(snap)
    else:
        snap.total_value = total_value
        snap.cash_balance = cash
        snap.invested_value = invested

    db.flush()
    return snap


def execute_trade(db: Session, ticker: str, shares: float, trade_type: str) -> Transaction:
    ticker = ticker.strip().upper()
    ticker_info = yf.Ticker(ticker).info
    if "currentPrice" not in ticker_info:
        raise HTTPException(status_code=404, detail="Ticker not found")
    current_price = ticker_info["currentPrice"]
    current_holding = get_or_create_holding(db, ticker)
    if trade_type == "sell" and shares > current_holding.shares:
        raise HTTPException(status_code=400, detail="Not enough shares!")
    if trade_type == "buy":
        cost = shares * current_price
        if get_cash_balance(db) < cost:
            raise HTTPException(status_code=400, detail="Insufficient cash")
        current_holding.avg_cost_basis = (
                (current_holding.shares * current_holding.avg_cost_basis) + (shares * current_price)
                ) / (current_holding.shares + shares)
        current_holding.shares += shares
    else:
        current_holding.shares -= shares
    new_transaction = Transaction(ticker=ticker, shares=shares, price=current_price, type=trade_type, timestamp=datetime.utcnow())
    db.add(new_transaction)
    db.flush()

    refresh_today_portfolio_snapshot(db)
    db.flush()

    return new_transaction

def get_cash_balance(db: Session) -> float:
    balance = STARTING_CASH
    all_transactions = db.query(Transaction).all()
    for t in all_transactions:
        if t.type == "buy": #ticker, shares, price, type, timestamp
            balance -= t.shares * t.price
        else:
            balance += t.shares * t.price
    return balance

