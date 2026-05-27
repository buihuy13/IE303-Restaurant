/**
 * OpenRouteService route `summary.duration` is in **seconds**.
 * UI shows whole **minutes**, rounded **up**, with a minimum of **1** when there is any positive duration.
 */
export function orsDurationSecondsToDisplayMinutes(seconds: number | null | undefined): number {
    if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
        return 0;
    }
    return Math.max(1, Math.ceil(seconds / 60));
}
