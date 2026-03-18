import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select"> & {
    hasError?: boolean;
};

function Select({ className, hasError, children, ...props }: SelectProps) {
    return (
        <select
            data-slot="select"
            className={cn(
                "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 focus-visible:border-brand-orange",
                "disabled:cursor-not-allowed disabled:opacity-50",
                hasError && "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive",
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export { Select };

