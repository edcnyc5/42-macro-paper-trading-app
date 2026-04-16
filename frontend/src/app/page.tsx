"use client";
import { useState } from "react";
import { usePortfolioSummary } from "@/hooks/use-portfolio-summary";
import TradeTicket from "@/components/trade-ticket";
import RecentTrades from "@/components/recent-trades";
import PortfolioValueChart from "@/components/portfolio-value-chart";


export default function HomePage() {
    const { data, isLoading, isError, error } = usePortfolioSummary();
    const [activePositionTab, setActivePositionTab] = useState<
        "holdings" | "trades"
    >("holdings");

    function tabButtonClass(tab: "holdings" | "trades") {
        return `rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activePositionTab === tab
                ? "bg-slate-100 text-slate-950"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
        }`;
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <header className="mb-8">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                        42 Macro Take Home Assignment
                    </p>
                    <h1 className="text-3xl font-semibold">
                        Paper Trading Portfolio Tracker
                    </h1>
                </header>

                {isLoading ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        Loading portfolio...
                    </div>
                ) : isError ? (
                    <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-200">
                        {(error as Error).message}
                    </div>
                ) : (
                    <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Cash Balance" value={data?.cash_balance ?? 0} />
                  <StatCard
                    label="Invested Value"
                    value={data?.total_invested_value ?? 0}
                  />
                  <StatCard label="Total Value" value={data?.total_value ?? 0} />
                  <StatCard
                    label="Unrealized P/L"
                    value={data?.total_unrealized_gain ?? 0}
                  />
                </section>

                <PortfolioValueChart />
    
                <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-xl font-semibold">Positions</h2>
                      <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
                        <button
                          type="button"
                          className={tabButtonClass("holdings")}
                          onClick={() => setActivePositionTab("holdings")}
                        >
                          Holdings
                        </button>
                        <button
                          type="button"
                          className={tabButtonClass("trades")}
                          onClick={() => setActivePositionTab("trades")}
                        >
                          Trade History
                        </button>
                      </div>
                    </div>

                    {activePositionTab === "holdings" ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="text-slate-400">
                            <tr className="border-b border-slate-800">
                              <th className="pb-3">Ticker</th>
                              <th className="pb-3">Shares</th>
                              <th className="pb-3">Avg Cost</th>
                              <th className="pb-3">Current Price</th>
                              <th className="pb-3">Market Value</th>
                              <th className="pb-3">Unrealized P/L</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.holdings.map((holding) => (
                              <tr
                                key={holding.id}
                                className="border-b border-slate-800/60"
                              >
                                <td className="py-3 font-medium">
                                  {holding.ticker}
                                </td>
                                <td className="py-3">{holding.shares}</td>
                                <td className="py-3">
                                  {formatCurrency(holding.avg_cost_basis)}
                                </td>
                                <td className="py-3">
                                  {formatCurrency(holding.current_price ?? 0)}
                                </td>
                                <td className="py-3">
                                  {formatCurrency(holding.current_value ?? 0)}
                                </td>
                                <td className="py-3">
                                  {formatCurrency(holding.unrealized_gain ?? 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <RecentTrades variant="embedded" />
                    )}
                  </div>
    
                  <TradeTicket />
                </section>
              </div>
            )}
          </div>
        </main>
    );
}

function StatCard( {label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
                {formatCurrency(value)}
            </p>
        </div>
    );
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(value);
}
