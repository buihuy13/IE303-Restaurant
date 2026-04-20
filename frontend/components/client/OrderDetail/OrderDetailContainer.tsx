"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { orderApi } from "@/lib/api/orderApi";
import { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderDetailClientWrapper from "./OrderDetailClientWrapper";

export default function OrderDetailPageContainer({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            try {
                const data = await orderApi.getOrderBySlug(params.slug);
                if (!cancelled) {
                    setOrder(data);
                }
            } catch {
                if (!cancelled) {
                    router.replace("/orders/not-found");
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
    }, [params.slug, router]);

    if (isLoading) {
        return <GlobalLoader label="Loading order" sublabel="Please wait a moment" />;
    }

    if (!order) {
        return null;
    }

    return <OrderDetailClientWrapper initialOrder={order} />;
}
