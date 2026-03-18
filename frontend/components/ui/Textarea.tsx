import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
    hasError?: boolean;
};

function Textarea({ className, hasError, ...props }: TextareaProps) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "flex min-h-[96px] w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
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

export { Textarea };

