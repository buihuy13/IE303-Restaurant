"use client";

import { queryApi } from "@/lib/api/queryApi";
import { computeDistanceBasedShippingVnd } from "@/lib/shipping/computeDistanceBasedShippingVnd";
import { useEffect, useState } from "react";

export type ShippingFeeQuote = {
    /** VND; 0 when quote inputs are incomplete (caller should not treat as “free” unless documented). */
    feeVnd: number;
    /** ORS route distance in meters, when API returned a positive value. */
    distanceMeters: number | null;
    loading: boolean;
    /** Set when the quote request failed; `feeVnd` falls back to `fallbackFeeVnd`. */
    error: boolean;
};

const FALLBACK_FEE_VND = 15_000;

type Params = {
    restaurantId: string | null | undefined;
    latitude: number | null | undefined;
    longitude: number | null | undefined;
};

function isFiniteCoord(n: unknown): n is number {
    return typeof n === "number" && Number.isFinite(n);
}

/**
 * Fetches route distance from query-service and maps it to a delivery fee in VND.
 */
export function useShippingFeeQuote({ restaurantId, latitude, longitude }: Params): ShippingFeeQuote {
    const [state, setState] = useState<ShippingFeeQuote>({
        feeVnd: 0,
        distanceMeters: null,
        loading: false,
        error: false,
    });

    useEffect(() => {
        let cancelled = false;
        const rid = restaurantId?.trim();
        if (!rid || !isFiniteCoord(latitude) || !isFiniteCoord(longitude)) {
            setState({ feeVnd: 0, distanceMeters: null, loading: false, error: false });
            return;
        }

        setState((s) => ({ ...s, loading: true, error: false }));

        void (async () => {
            try {
                const res = await queryApi.getRestaurantById(rid, latitude, longitude);
                if (cancelled) return;
                const d = res.data?.distance;
                const dm = typeof d === "number" && d > 10 ? d : null;
                const feeVnd = dm != null ? computeDistanceBasedShippingVnd(dm) : FALLBACK_FEE_VND;
                setState({
                    feeVnd,
                    distanceMeters: dm,
                    loading: false,
                    error: dm === null,
                });
            } catch {
                if (cancelled) return;
                setState({
                    feeVnd: FALLBACK_FEE_VND,
                    distanceMeters: null,
                    loading: false,
                    error: true,
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [restaurantId, latitude, longitude]);

    return state;
}
