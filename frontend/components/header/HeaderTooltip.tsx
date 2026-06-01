"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HeaderTooltipProps {
    label: string;
    children: ReactNode;
    align?: "center" | "end";
    className?: string;
}

export default function HeaderTooltip({ label, children, align = "center", className }: HeaderTooltipProps) {
    return (
        <span className={cn("group/header-tooltip relative inline-flex items-center justify-center leading-none", className)}>
            {children}
            <span
                role="tooltip"
                className={cn(
                    "pointer-events-none invisible absolute top-full z-[70] mt-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/header-tooltip:visible group-hover/header-tooltip:opacity-100 group-has-[:focus-visible]/header-tooltip:visible group-has-[:focus-visible]/header-tooltip:opacity-100",
                    align === "end" ? "right-0" : "left-1/2 -translate-x-1/2",
                )}
            >
                {label}
            </span>
        </span>
    );
}
