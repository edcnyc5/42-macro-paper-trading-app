"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrade, TradeRequest } from "@/lib/api";


export function useCreateTrade() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: TradeRequest) => createTrade(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
            queryClient.invalidateQueries({ queryKey: ["portfolio-history"] });
            queryClient.invalidateQueries({ queryKey: ["trade-history"] });
        },
    });
}
