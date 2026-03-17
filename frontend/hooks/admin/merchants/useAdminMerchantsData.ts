import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { merchantApi } from "@/lib/api/merchantApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { orderApi } from "@/lib/api/orderApi";
import { OrderStatus } from "@/types/order.type";
import type { Merchant } from "@/types";

export interface MerchantWithStats extends Merchant {
    totalRestaurants: number;
    totalRevenue: number;
}

export function useAdminMerchantsData() {
    const [merchants, setMerchants] = useState<MerchantWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchants = useCallback(async () => {
        setLoading(true);
        try {
            const data = await merchantApi.getAllMerchants();
            const baseMerchants = Array.isArray(data) ? data : [];

            const params = new URLSearchParams({ lat: "10.9032198", lon: "106.7750317" });
            const restaurantsResponse = await restaurantApi.getAllRestaurants(params);
            const restaurants = Array.isArray(restaurantsResponse.data) ? restaurantsResponse.data : [];

            const restaurantCountByMerchantId = new Map<string, number>();
            const restaurantIdToMerchantId = new Map<string, string>();
            for (const r of restaurants) {
                restaurantCountByMerchantId.set(r.merchantId, (restaurantCountByMerchantId.get(r.merchantId) || 0) + 1);
                restaurantIdToMerchantId.set(r.id, r.merchantId);
            }

            const revenueByMerchantId = new Map<string, number>();
            let page = 1;
            const limit = 100;
            const maxPages = 20;
            while (page <= maxPages) {
                const { orders, pagination } = await orderApi.getAllOrders({
                    page,
                    limit,
                    status: OrderStatus.COMPLETED,
                });
                for (const o of orders) {
                    const merchantId =
                        o.merchantId || (o.restaurantId ? restaurantIdToMerchantId.get(o.restaurantId) : undefined);
                    if (!merchantId) continue;
                    revenueByMerchantId.set(
                        merchantId,
                        (revenueByMerchantId.get(merchantId) || 0) + (o.finalAmount || 0),
                    );
                }
                if (!pagination || page >= (pagination.totalPages || 1)) break;
                page += 1;
            }

            setMerchants(
                baseMerchants.map((m) => ({
                    ...m,
                    totalRestaurants: restaurantCountByMerchantId.get(m.id) || 0,
                    totalRevenue: revenueByMerchantId.get(m.id) || 0,
                })),
            );
        } catch (error) {
            console.error("Failed to fetch merchants:", error);
            toast.error("Failed to load merchants.");
            setMerchants([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMerchants().catch(() => {});
    }, [fetchMerchants]);

    return { merchants, loading, fetchMerchants };
}
