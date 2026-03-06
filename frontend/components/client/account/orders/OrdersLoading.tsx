"use client";

import { Loader2 } from "lucide-react";

export function OrdersLoading() {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
        </div>
    );
}
