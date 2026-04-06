"use client";

import { Loader2 } from "lucide-react";

export function SettingsLoading() {
    return (
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-gray-200/90 bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
    );
}
