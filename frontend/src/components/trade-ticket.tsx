"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCreateTrade } from "@/hooks/use-create-trade";
import { searchStock, TradeType } from "@/lib/api";

export default function TradeTicket() {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [type, setType] = useState<TradeType>("buy");
  const [lookupInput, setLookupInput] = useState("");
  const [committedLookup, setCommittedLookup] = useState("");

  const tradeMutation = useCreateTrade();

  const tickerLookup = useQuery({
    queryKey: ["ticker-lookup", committedLookup],
    queryFn: () => searchStock(committedLookup),
    enabled: committedLookup.trim().length > 0,
    retry: 0,
  });

  const lookupPreview = useMemo(() => {
    if (!tickerLookup.data) return null;
    return `${tickerLookup.data.name} · ${tickerLookup.data.ticker}`;
  }, [tickerLookup.data]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedTicker = ticker.trim().toUpperCase();
    const parsedShares = Number(shares);

    if (!normalizedTicker || !parsedShares || parsedShares <= 0) {
      return;
    }

    tradeMutation.mutate({
      ticker: normalizedTicker,
      shares: parsedShares,
      type,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Trade Ticket</h2>
      <p className="mt-2 text-sm text-slate-400">
        Submit paper buy and sell orders.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="ticker"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Ticker
          </label>
          <input
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="AAPL"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-slate-500"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Lookup ticker (ex: AAPL)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-slate-500 sm:flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const q = lookupInput.trim().toUpperCase();
                if (!q) return;
                setCommittedLookup(q);
                setTicker(q);
              }}
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              Lookup
            </button>
          </div>

          {tickerLookup.isFetching ? (
            <p className="mt-2 text-xs text-slate-400">Looking up...</p>
          ) : null}

          {tickerLookup.isError ? (
            <p className="mt-2 text-xs text-red-300">
              {(tickerLookup.error as Error).message}
            </p>
          ) : null}

          {tickerLookup.isSuccess && lookupPreview ? (
            <p className="mt-2 text-xs text-slate-300">{lookupPreview}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="shares"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Shares
          </label>
          <input
            id="shares"
            type="number"
            min="1"
            step="1"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="10"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Side
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("buy")}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                type === "buy"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setType("sell")}
              className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                type === "sell"
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {tradeMutation.isError ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {(tradeMutation.error as Error).message}
          </div>
        ) : null}

        {tradeMutation.isSuccess ? (
          <div className="rounded-xl border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
            Trade submitted successfully.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={tradeMutation.isPending}
          className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {tradeMutation.isPending ? "Submitting..." : "Submit Trade"}
        </button>
      </form>
    </div>
  );
}
