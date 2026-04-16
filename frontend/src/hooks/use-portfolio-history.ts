"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolioHistory } from "@/lib/api";

export function usePortfolioHistory() {
  return useQuery({
    queryKey: ["portfolio-history"],
    queryFn: getPortfolioHistory,
  });
}
