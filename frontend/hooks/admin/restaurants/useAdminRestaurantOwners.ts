import { useEffect, useState } from "react";
import { authApi } from "@/lib/api/authApi";
import type { Restaurant, User } from "@/types";

export function useAdminRestaurantOwners(restaurants: Restaurant[]) {
    const [ownersByMerchantId, setOwnersByMerchantId] = useState<Record<string, User>>({});

    useEffect(() => {
        const looksLikeUserId = (id: string) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        const merchantIds = Array.from(
            new Set(restaurants.map((r) => r.merchantId).filter((id): id is string => Boolean(id))),
        );
        const missing = merchantIds.filter((id) => looksLikeUserId(id) && !ownersByMerchantId[id]);
        if (missing.length === 0) return;

        let cancelled = false;

        const run = async () => {
            const results = await Promise.allSettled(missing.map((id) => authApi.getUserById(id)));
            if (cancelled) return;

            const next: Record<string, User> = {};
            for (const r of results) {
                if (r.status === "fulfilled" && r.value && r.value.id) {
                    next[r.value.id] = r.value;
                }
            }

            if (Object.keys(next).length > 0) {
                setOwnersByMerchantId((prev) => ({ ...prev, ...next }));
            }
        };

        run().catch(() => {
            // best-effort enrichment
        });

        return () => {
            cancelled = true;
        };
    }, [restaurants, ownersByMerchantId]);

    return ownersByMerchantId;
}

