from fastapi import APIRouter, HTTPException
import yfinance as yf
router = APIRouter()


@router.get("/search") 
def search_stock(q: str):   
  q = q.strip().upper()
  stockInfo = yf.Ticker(q).info   
  if "symbol" not in stockInfo:
    raise HTTPException(status_code=404, detail="Ticker not found")

  if "currentPrice" not in stockInfo or stockInfo["currentPrice"] is None:
    raise HTTPException(status_code=404, detail="Ticker not found")

  return {
    "ticker": stockInfo["symbol"], 
    "name": stockInfo.get("longName") or stockInfo.get("shortName") or stockInfo["symbol"],
    "current_price": stockInfo["currentPrice"], 
  }     


