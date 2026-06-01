"use client";

import { Button } from "@/components/ui/Button";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import type { ProductSize } from "@/types";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type QuickAddSizeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    sizes: ProductSize[];
    isAdding: boolean;
    onConfirm: (size: ProductSize, quantity: number) => void;
};

export function QuickAddSizeDialog({
    open,
    onOpenChange,
    productName,
    sizes,
    isAdding,
    onConfirm,
}: QuickAddSizeDialogProps) {
    const { theme } = useClientTheme();
    const isDark = theme === "dark";
    const sortedSizes = useMemo(() => [...sizes].sort((a, b) => a.price - b.price), [sizes]);
    const [selectedSizeId, setSelectedSizeId] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!open) return;
        setSelectedSizeId((prev) => prev || sortedSizes[0]?.id || "");
        setQuantity(1);
    }, [open, sortedSizes]);

    useEffect(() => {
        if (!open || !mounted) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open, mounted]);

    if (!open || !mounted) return null;

    const selectedSize = sortedSizes.find((size) => size.id === selectedSizeId) ?? null;

    const resetAndClose = () => {
        setSelectedSizeId("");
        setQuantity(1);
        onOpenChange(false);
    };

    const getBackendSubtitle = (size: ProductSize): string | null => {
        const row = size as ProductSize & {
            description?: string | null;
            servingText?: string | null;
            subtitle?: string | null;
        };
        const raw = row.description ?? row.servingText ?? row.subtitle ?? null;
        if (typeof raw !== "string") return null;
        const normalized = raw.trim();
        return normalized.length > 0 ? normalized : null;
    };

    const handleConfirm = () => {
        if (!selectedSize || isAdding) return;
        onConfirm(selectedSize, quantity);
    };

    const overlayClass = isDark ? "bg-black/55 backdrop-blur-[2px]" : "bg-black/30 backdrop-blur-[1px]";
    const panelClass = isDark
        ? "border-white/10 bg-[#1f1f1f] shadow-[0_22px_60px_rgba(0,0,0,0.55)]"
        : "border-gray-200/90 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]";
    const titleClass = isDark ? "text-white" : "text-gray-900";
    const subtitleClass = isDark ? "text-white/55" : "text-gray-500";
    const closeBtnClass = isDark ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-700";
    const handleClass = isDark ? "bg-white/30" : "bg-gray-300";
    const quantityBoxClass = isDark
        ? "border-white/12 bg-white/[0.03]"
        : "border-gray-200 bg-gray-50";
    const quantityLabelClass = isDark ? "text-white/85" : "text-gray-700";
    const qtyBtnClass = isDark
        ? "border-white/20 text-white/90 hover:border-brand-orange/60"
        : "border-gray-300 text-gray-700 hover:border-brand-orange/50";
    const qtyNumberClass = isDark ? "text-white" : "text-gray-900";

    return createPortal(
        <div
            className={`fixed inset-0 z-[120] ${overlayClass}`}
            onClick={resetAndClose}
            role="dialog"
            aria-modal="true"
            aria-label={`Choose size and quantity for ${productName}`}
        >
            <div
                className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-3xl border px-4 pb-4 pt-3 md:bottom-auto md:top-1/2 md:rounded-3xl md:px-5 md:pt-4 md:-translate-y-1/2 ${panelClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full ${handleClass}`} />
                <button
                    type="button"
                    onClick={resetAndClose}
                    className={`absolute right-4 top-3 transition-colors ${closeBtnClass}`}
                    aria-label="Close size picker"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="mb-4 pr-8">
                    <p className={`line-clamp-2 text-[1.75rem] leading-tight font-semibold ${titleClass}`}>{productName}</p>
                    <p className={`mt-1 text-xs uppercase tracking-wide ${subtitleClass}`}>Chọn size và số lượng</p>
                </div>

                <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {sortedSizes.map((size) => {
                    const sizeTitle = size.sizeName?.trim() || "Tiêu chuẩn";
                    const sizeSubtitle = getBackendSubtitle(size);
                    return (
                    <button
                        key={size.id}
                        type="button"
                        disabled={isAdding}
                        onClick={() => setSelectedSizeId(size.id)}
                        className={`w-full flex items-center justify-between gap-2.5 rounded-2xl border px-4 py-2.5 text-left transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                            selectedSizeId === size.id
                                ? isDark
                                    ? "border-brand-orange/70 bg-brand-orange/10"
                                    : "border-brand-orange/70 bg-brand-orange/[0.06]"
                                : isDark
                                    ? "border-white/15 bg-white/[0.02] hover:border-brand-orange/45"
                                    : "border-gray-200 bg-white hover:border-brand-orange/45"
                        }`}
                    >
                        <div className="min-w-0 flex-1">
                            <p className={`text-lg leading-tight font-semibold ${titleClass}`}>
                                {sizeTitle}
                            </p>
                            {sizeSubtitle && (
                                <p className={`mt-1 text-[13px] leading-snug ${isDark ? "text-white/70" : "text-gray-500"}`}>
                                    {sizeSubtitle}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-2xl leading-none font-bold text-brand-orange whitespace-nowrap">
                                {size.price.toLocaleString("vi-VN")} ₫
                            </p>
                            <span
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                                    selectedSizeId === size.id
                                        ? "border-brand-orange bg-brand-orange text-white"
                                        : isDark
                                            ? "border-white/30"
                                            : "border-gray-300 text-transparent"
                                }`}
                            >
                                {selectedSizeId === size.id ? "✓" : ""}
                            </span>
                        </div>
                    </button>
                )})}
                </div>

                <div className={`mt-3.5 flex items-center justify-between rounded-2xl border px-4 py-3 ${quantityBoxClass}`}>
                    <span className={`text-base leading-none font-medium ${quantityLabelClass}`}>Số lượng</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${qtyBtnClass}`}
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1 || isAdding}
                            aria-label="Decrease quantity"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className={`w-7 text-center text-lg leading-none font-semibold ${qtyNumberClass}`}>{quantity}</span>
                        <button
                            type="button"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${qtyBtnClass}`}
                            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                            disabled={isAdding}
                            aria-label="Increase quantity"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-3.5">
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selectedSize || isAdding}
                        className="h-12 w-full rounded-2xl bg-brand-orange text-base font-semibold text-white hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
