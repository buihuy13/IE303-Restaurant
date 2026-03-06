"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { User } from "@/types";

interface RejectMerchantModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    target: User | null;
    reason: string;
    onReasonChange: (value: string) => void;
    processing: boolean;
    onConfirm: () => void;
}

export function RejectMerchantModal({
    open,
    onOpenChange,
    target,
    reason,
    onReasonChange,
    processing,
    onConfirm,
}: RejectMerchantModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl outline-none dark:border-gray-700 dark:bg-gray-900">
                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                        Reject merchant
                    </Dialog.Title>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Provide a reason to reject {target?.username}.
                    </div>
                    <textarea
                        value={reason}
                        onChange={(e) => onReasonChange(e.target.value)}
                        rows={4}
                        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-yellow dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        placeholder="Enter rejection reason..."
                    />
                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => onOpenChange(false)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={onConfirm}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
