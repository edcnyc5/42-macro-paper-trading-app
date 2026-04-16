from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import portfolio, stocks, trades

app = FastAPI(title="42 Macro Paper Trader")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
app.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
app.include_router(trades.router, prefix="/trades", tags=["trades"])
