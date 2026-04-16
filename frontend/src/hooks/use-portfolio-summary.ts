"use client";

import { useQuery } from "@tanstack/react-query";
import { getPortfolioSummary } from "@/lib/api";

export function usePortfolioSummary() {
    return useQuery({
        queryKey: ["portfolio-summary"],
        queryFn: getPortfolioSummary,
    });
}
