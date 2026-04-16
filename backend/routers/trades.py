from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import TradeRequest, TransactionOut
from models import Transaction
from services import execute_trade
router = APIRouter()

@router.post("/", response_model=TransactionOut)
async def create_trade(tr: TradeRequest, db: Session = Depends(get_db)):
    trade = execute_trade(db, tr.ticker, tr.shares, tr.type)
    db.commit()
    db.refresh(trade)
    return TransactionOut.model_validate(trade)

@router.get("/history", response_model=list[TransactionOut])
def trade_history(db: Session = Depends(get_db)):
    return (
        db.query(Transaction)
        .order_by(Transaction.timestamp.desc())
        .all()
    )
