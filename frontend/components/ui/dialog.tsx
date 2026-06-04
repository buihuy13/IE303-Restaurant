"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]" />
                <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl outline-none dark:bg-gray-800">
                    <div className={title || description ? "mb-4 pr-8" : "sr-only"}>
                        <DialogPrimitive.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {title || "Dialog"}
                        </DialogPrimitive.Title>
                        {description && (
                            <DialogPrimitive.Description className="text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </DialogPrimitive.Description>
                        )}
                    </div>
                    <DialogPrimitive.Close
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </DialogPrimitive.Close>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

export function DialogContent({ children }: { children: ReactNode }) {
    return <div>{children}</div>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
    return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{children}</h3>;
}

export function DialogDescription({ children }: { children: ReactNode }) {
    return <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
    return <div className="flex gap-3 justify-end mt-4">{children}</div>;
}
