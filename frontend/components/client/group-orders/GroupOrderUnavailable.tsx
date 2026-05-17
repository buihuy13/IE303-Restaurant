"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function GroupOrderUnavailable({ className = "" }: { className?: string }) {
    return (
        <div className={`rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center ${className}`} role="status">
            <p className="text-lg font-semibold text-amber-900">Group orders are not available yet</p>
            <p className="mt-2 text-sm text-amber-800">
                This feature is not deployed on the backend. Use your cart to place a normal order instead.
            </p>
            <Button asChild variant="brand" className="mt-4 rounded-full">
                <Link href="/cart">Go to cart</Link>
            </Button>
        </div>
    );
}
