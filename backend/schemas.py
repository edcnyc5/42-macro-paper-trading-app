from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import Optional

# -- TRANSACTIONS --
class TradeRequest(BaseModel):
    ticker: str
    shares: float
    type: str

    @validator("shares")
    def shares_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Shares must be greater than zero")
        return v

    @validator("type")
    def type_must_be_valid(cls, v):
        if v not in ["buy", "sell"]:
            raise ValueError("Type must be buy or sell")
        return v

class TransactionOut(BaseModel):
    id: int
    ticker: str
    shares: float
    price: float
    type: str
    timestamp: datetime

    class Config:
        from_attributes = True

# -- HOLDINGS --
class HoldingOut(BaseModel):
    id: int
    ticker: str
    shares: float
    avg_cost_basis: float
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    unrealized_gain: Optional[float] = None
    unrealized_gain_pct: Optional[float] = None

    class Config:
        from_attributes = True

# -- PORTFOLIO SNAPSHOT --
class SnapshotOut(BaseModel):
    date: date
    total_value: float
    cash_balance: float
    invested_value: float

    class Config:
        from_attributes = True

# -- PORTFOLIO SUMMARY --
class PortfolioSummary(BaseModel):
    cash_balance: float
    total_invested_value: float
    total_value: float
    total_unrealized_gain: float
    total_unrealized_gain_pct: float
    holdings: list[HoldingOut]
