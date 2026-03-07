"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { UseJoinGroupOrderPageReturn } from "@/hooks/client/group-orders/useJoinGroupOrderPage";

export interface JoinGroupOrderPageViewProps {
    shareToken: string;
    state: UseJoinGroupOrderPageReturn;
}

export function JoinGroupOrderPageView({ shareToken, state }: JoinGroupOrderPageViewProps) {
    return (
        <main className="bg-gray-50 min-h-screen py-12">
            <div className="custom-container">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href={`/group-orders/${shareToken}`}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EE4D2D] transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to group order
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {state.isJoined ? "Update your items" : "Join Group Order"}
                        </h1>
                        <p className="text-gray-600">{state.groupOrder?.restaurantName}</p>
                    </div>

                    {!state.canJoin && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800">This group order is no longer accepting items.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Menu</h2>
                                {state.products.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Loading menu...</p>
                                ) : (
                                    <div className="space-y-4">
                                        {state.products.map((product) => {
                                            const selectedItem = state.selectedItems.get(product.id);
                                            const imageUrl = getImageUrl(product.imageURL);
                                            const defaultSize = product.productSizes?.[0];
                                            return (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                                >
                                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
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
                                                            <p className="text-sm text-[#EE4D2D] font-bold">
                                                                ${defaultSize.price.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedItem ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => state.handleRemoveItem(product.id)}
                                                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
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
                                                                className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => state.handleAddItem(product)}
                                                            disabled={!state.canJoin}
                                                            className="px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Add
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Selected items
                                </h2>
                                {state.selectedItems.size === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No items selected.</p>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                            {Array.from(state.selectedItems.values()).map((item) => (
                                                <div
                                                    key={item.productId}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
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
                                                <span className="text-xl font-bold text-[#EE4D2D]">
                                                    ${state.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={state.handleSubmit}
                                                disabled={
                                                    state.isSubmitting ||
                                                    !state.canJoin ||
                                                    state.selectedItems.size === 0
                                                }
                                                className="w-full px-4 py-3 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {state.isSubmitting
                                                    ? "Processing..."
                                                    : state.isJoined
                                                      ? "Update items"
                                                      : "Confirm join"}
                                            </button>
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

