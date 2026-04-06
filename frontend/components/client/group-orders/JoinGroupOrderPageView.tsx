"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { UseJoinGroupOrderPageReturn } from "@/hooks/client/group-orders/useJoinGroupOrderPage";
import { Button } from "@/components/ui/Button";

export interface JoinGroupOrderPageViewProps {
    shareToken: string;
    state: UseJoinGroupOrderPageReturn;
}

export function JoinGroupOrderPageView({ shareToken, state }: JoinGroupOrderPageViewProps) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white py-12">
            <div className="custom-container">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href={`/group-orders/${shareToken}`}
                            className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-brand-orange"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to group order
                        </Link>
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                            {state.isJoined ? "Update your items" : "Join Group Order"}
                        </h1>
                        <p className="text-gray-600">{state.groupOrder?.restaurantName}</p>
                    </div>

                    {!state.canJoin && (
                        <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                            <p className="text-yellow-800">This group order is no longer accepting items.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                                <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">Menu</h2>
                                {state.products.length === 0 ? (
                                    <div className="animate-pulse space-y-4 py-2">
                                        <div className="h-20 rounded-2xl bg-gray-100" />
                                        <div className="h-20 rounded-2xl bg-gray-100" />
                                        <div className="h-20 rounded-2xl bg-gray-100" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {state.products.map((product) => {
                                            const selectedItem = state.selectedItems.get(product.id);
                                            const imageUrl = getImageUrl(product.imageURL);
                                            const defaultSize = product.productSizes?.[0];
                                            return (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                                                >
                                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                                                        {imageUrl && imageUrl !== "/placeholder.png" ? (
                                                            <Image
                                                                src={imageUrl}
                                                                alt={product.productName}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                                🍽️
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {product.productName}
                                                        </h3>
                                                        {defaultSize && (
                                                            <p className="text-sm text-brand-orange font-bold">
                                                                ${defaultSize.price.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedItem ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => state.handleRemoveItem(product.id)}
                                                                className="rounded-full p-1 transition-colors hover:bg-gray-100"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                            <span className="w-10 text-center font-semibold">
                                                                {selectedItem.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => state.handleAddItem(product)}
                                                                disabled={!state.canJoin}
                                                                className="rounded-full p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={() => state.handleAddItem(product)}
                                                            disabled={!state.canJoin}
                                                            variant="brand"
                                                            size="sm"
                                                            className="rounded-full shadow-sm"
                                                        >
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-8 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                                <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Selected items
                                </h2>
                                {state.selectedItems.size === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                        <p className="text-sm text-gray-600">No items selected yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                            {Array.from(state.selectedItems.values()).map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-3"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 truncate">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ${item.price.toFixed(2)} x {item.quantity}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => state.handleRemoveItem(item.productId)}
                                                        className="rounded-full p-2 transition-colors hover:bg-white"
                                                        aria-label="Remove item"
                                                    >
                                                        <X className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-semibold text-gray-900">Total:</span>
                                                <span className="text-xl font-bold text-brand-orange">
                                                    ${state.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <Button
                                                onClick={state.handleSubmit}
                                                disabled={
                                                    state.isSubmitting ||
                                                    !state.canJoin ||
                                                    state.selectedItems.size === 0
                                                }
                                                variant="brand"
                                                className="h-12 w-full rounded-full font-medium shadow-sm"
                                            >
                                                {state.isSubmitting
                                                    ? "Processing..."
                                                    : state.isJoined
                                                      ? "Update items"
                                                      : "Confirm join"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

