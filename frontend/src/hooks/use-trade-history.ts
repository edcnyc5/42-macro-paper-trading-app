"use client";

import { useQuery } from "@tanstack/react-query";
import { getTradeHistory } from "@/lib/api";

export function useTradeHistory() {
    return useQuery({
        queryKey: ["trade-history"],
        queryFn: getTradeHistory,
    });
}
