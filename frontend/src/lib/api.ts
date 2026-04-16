const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type TradeType = "buy" | "sell";

export type TradeRequest = {
    ticker: string;
    shares: number;
    type: TradeType;
};

export type Transaction = {
    id: number;
    ticker: string;
    shares: number;
    price: number;
    type: TradeType;
    timestamp: string;
};

export type Holding = {
    id: number;
    ticker: string;
    shares: number;
    avg_cost_basis: number;
    current_price: number | null;
    current_value: number | null;
    unrealized_gain: number | null;
    unrealized_gain_pct: number | null;
};

export type PortfolioSummary = {
    cash_balance: number;
    total_invested_value: number;
    total_value: number;
    total_unrealized_gain: number;
    total_unrealized_gain_pct: number;
    holdings: Holding[];
};

export type PortfolioSnapshot = {
    date: string;
    total_value: number;
    cash_balance: number;
    invested_value: number;
};

export type StockSearchResult = {
    ticker: string;
    name: string;
    current_price: number;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        let detail = "Request failed";
        try {
            const data = await res.json();
            detail = data?.detail ?? detail;
        } catch {
            //ignore json parse failure for now
        }
        throw new Error(detail);
    }

    return res.json() as Promise<T>;
}

export function getPortfolioSummary() {
    return apiFetch<PortfolioSummary>("/portfolio/summary");
}

export function getPortfolioHistory() {
    return apiFetch<PortfolioSnapshot[]>("/portfolio/history");
}

export function searchStock(query: string) {
    return apiFetch<StockSearchResult>(
        `/stocks/search?q=${encodeURIComponent(query)}`
    );
}

export function createTrade(payload: TradeRequest) {
    return apiFetch<Transaction>("/trades/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getTradeHistory() {
    return apiFetch<Transaction[]>("/trades/history");
}
