/**
 * Distance-based delivery fee in VND.
 *
 * Uses `distance` from **query-service** `GET /api/query/restaurants/{id}?lat=&lon=`,
 * which follows OpenRouteService `summary.distance` in **meters**.
 *
 * Tier (tunable): base covers ~2 km, then per-km add-on, clamped to a sensible range.
 */
const BASE_VND = 15_000;
const INCLUDED_KM = 2;
const PER_KM_AFTER_INCLUDED_VND = 4_000;
const MIN_SHIPPING_VND = 10_000;
const MAX_SHIPPING_VND = 100_000;

export function computeDistanceBasedShippingVnd(distanceMeters: number): number {
    if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
        return BASE_VND;
    }
    const km = distanceMeters / 1000;
    const extraKm = Math.max(0, km - INCLUDED_KM);
    const raw = BASE_VND + extraKm * PER_KM_AFTER_INCLUDED_VND;
    return Math.min(MAX_SHIPPING_VND, Math.max(MIN_SHIPPING_VND, Math.round(raw)));
}
