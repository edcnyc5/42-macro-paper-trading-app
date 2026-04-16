"use client";

import { useTradeHistory } from "@/hooks/use-trade-history";

type Props = {
  variant?: "card" | "embedded";
};

export default function RecentTrades({ variant = "card" }: Props) {
  const { data, isLoading, isError, error } = useTradeHistory();

  const topSpacingClass = variant === "embedded" ? "mt-0" : "mt-4";

  const body = (
    <>
      {isLoading ? (
        <p className={`${topSpacingClass} text-sm text-slate-400`}>
          Loading trade history...
        </p>
      ) : isError ? (
        <p className={`${topSpacingClass} text-sm text-red-300`}>
          {(error as Error).message}
        </p>
      ) : !data || data.length === 0 ? (
        <p className={`${topSpacingClass} text-sm text-slate-400`}>
          No trades yet.
        </p>
      ) : (
        <div className={`${topSpacingClass} overflow-x-auto`}>
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="pb-3">Ticker</th>
                <th className="pb-3">Side</th>
                <th className="pb-3">Shares</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((trade) => (
                <tr key={trade.id} className="border-b border-slate-800/60">
                  <td className="py-3 font-medium">{trade.ticker}</td>
                  <td
                    className={`py-3 font-medium ${
                      trade.type === "buy" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {trade.type.toUpperCase()}
                  </td>
                  <td className="py-3">{trade.shares}</td>
                  <td className="py-3">{formatCurrency(trade.price)}</td>
                  <td className="py-3 text-slate-400">
                    {formatDateTime(trade.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  if (variant === "embedded") {
    return body;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Trade History</h2>
      {body}
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
