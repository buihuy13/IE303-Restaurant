import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
    /**
     * Set true to show error styling (UI-only).
     * This does not change any validation/logic behavior.
     */
    hasError?: boolean;
};

function Input({ className, type, hasError, ...props }: InputProps) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 focus-visible:border-brand-orange",
                "disabled:cursor-not-allowed disabled:opacity-50",
                hasError && "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive",
                className,
            )}
            {...props}
        />
    );
}

export { Input };

