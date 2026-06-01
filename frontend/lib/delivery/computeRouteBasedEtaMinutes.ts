import { orsDurationSecondsToDisplayMinutes } from "@/lib/utils/routeDuration";

/**
 * Stable 15–20 minute preparation buffer for the same `seed` (e.g. order id).
 */
export function stablePrepMinutesFromSeed(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    }
    return 15 + (Math.abs(h) % 6);
}

/**
 * query-service / ORS route `duration` is in **seconds** → whole travel minutes (ceil, min 1)
 * plus preparation buffer (15–20 min, stable per order).
 */
export function computeRouteBasedEtaMinutes(durationSeconds: number | null | undefined, orderSeed: string): number {
    const travel = orsDurationSecondsToDisplayMinutes(durationSeconds);
    const prep = stablePrepMinutesFromSeed(orderSeed);
    if (travel <= 0) return prep;
    return travel + prep;
}

/** When route API cannot run (no coordinates / error), show a conservative urban default. */
export function fallbackEtaMinutesWithoutRoute(orderSeed: string): number {
    const ASSUMED_TRAVEL_MIN = 20;
    return stablePrepMinutesFromSeed(orderSeed) + ASSUMED_TRAVEL_MIN;
}
