"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeliveryStatusPageClientWrapper from "./DeliveryStatusPageClientWrapper";

export default function OrderStatusPage({ slug }: { slug: string }) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            try {
                const data = await orderApi.getOrderBySlug(slug, { cacheBust: true });
                if (!cancelled) {
                    setOrder(data);
                }
            } catch {
                if (!cancelled) {
                    router.replace("/delivery/not-found");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchOrder();
        return () => {
            cancelled = true;
        };
    }, [slug, router]);

    if (isLoading) {
        return <GlobalLoader label="Loading order tracking" sublabel="Please wait a moment" />;
    }

    if (!order) {
        return null;
    }

    return <DeliveryStatusPageClientWrapper initialOrder={order} />;
}
