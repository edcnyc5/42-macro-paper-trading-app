"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ColorType, LineSeries, createChart } from "lightweight-charts";
import { usePortfolioHistory } from "@/hooks/use-portfolio-history";

export default function PortfolioValueChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, isError, error } = usePortfolioHistory();

  const points = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((snap) => {
      return { time: snap.date, value: snap.total_value };
    });
  }, [data]);

  const latest = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) => (a.date < b.date ? -1 : 1)).at(-1) ?? null;
  }, [data]);

  const todayYmd = useMemo(() => formatLocalYmd(new Date()), []);

  const [hover, setHover] = useState<{ ymd: string; value: number } | null>(
    null
  );

  const effectiveHover = useMemo(() => {
    if (!hover) return null;
    const exists = points.some((p) => p.time === hover.ymd);
    return exists ? hover : null;
  }, [hover, points]);

  const display = useMemo(() => {
    if (effectiveHover) {
      return {
        ymd: effectiveHover.ymd,
        value: effectiveHover.value,
        mode: "hover" as const,
      };
    }
    if (!latest) return null;
    return {
      ymd: latest.date,
      value: latest.total_value,
      mode: "latest" as const,
    };
  }, [effectiveHover, latest]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "rgb(2 6 23)" },
        textColor: "rgb(226 232 240)",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)" },
        horzLines: { color: "rgba(148, 163, 184, 0.12)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      crosshair: { vertLine: { color: "rgba(148, 163, 184, 0.35)" } },
    });

    const series = chart.addSeries(LineSeries, {
      color: "rgb(56 189 248)",
      lineWidth: 2,
    });

    series.setData(points);

    chart.timeScale().fitContent();

    const onCrosshairMove: Parameters<typeof chart.subscribeCrosshairMove>[0] = (
      param
    ) => {
      if (!param.point) {
        setHover(null);
        return;
      }

      const datum = param.seriesData.get(series) as { value?: number } | undefined;
      const value = datum?.value;
      const time = param.time;

      if (typeof value !== "number" || time === undefined) {
        return;
      }

      if (typeof time === "string") {
        setHover({ ymd: time, value });
        return;
      }

      if (typeof time === "number") {
        // Shouldn't happen for business-day strings, but keep a safe fallback.
        setHover({
          ymd: new Date(time * 1000).toISOString().slice(0, 10),
          value,
        });
      }
    };

    chart.subscribeCrosshairMove(onCrosshairMove);

    const ro = new ResizeObserver(() => {
      chart.resize(el.clientWidth, el.clientHeight);
    });
    ro.observe(el);

    return () => {
      chart.unsubscribeCrosshairMove(onCrosshairMove);
      ro.disconnect();
      chart.remove();
    };
  }, [points]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Portfolio Value</h2>
          <p className="mt-2 text-sm text-slate-400">
            Snapshot-based history (updated after trades).
          </p>
        </div>

        {display ? (
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {display.mode === "hover"
                ? "As of"
                : display.ymd === todayYmd
                  ? "Today"
                  : latest && display.ymd === latest.date
                    ? "Latest"
                    : "As of"}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(display.value)}
            </p>
            <p className="mt-1 text-sm text-slate-400 tabular-nums">
              {formatYmdForDisplay(display.ymd)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
            Loading chart...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
            {(error as Error).message}
          </div>
        ) : points.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
            No snapshots yet. Place a trade to create today&apos;s snapshot.
          </div>
        ) : (
          <div ref={containerRef} className="h-[320px] w-full" />
        )}
      </div>
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

function formatLocalYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatYmdForDisplay(ymd: string) {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  if (!y || !m || !d) return ymd;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}
