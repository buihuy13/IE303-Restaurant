"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Copy, DollarSign, Edit, Lock, Trash2, Users, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { GroupOrderStatus } from "@/types/groupOrder.type";
import { useGroupOrderData } from "@/hooks/client/group-orders/useGroupOrderData";
import { useGroupOrderActions } from "@/hooks/client/group-orders/useGroupOrderActions";
import { useGroupOrderPermissions } from "@/hooks/client/group-orders/useGroupOrderPermissions";
import { useGroupOrderProductImage } from "@/hooks/client/group-orders/useGroupOrderProductImage";

function formatPrice(price: number) {
    return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function GroupOrderPageClient() {
    const params = useParams();
    const shareToken = params?.shareToken as string;
    const { user, isAuthenticated } = useAuthStore();
    const { groupOrder, setGroupOrder, loading, fetchGroupOrder } = useGroupOrderData(shareToken);
    const actions = useGroupOrderActions(
        shareToken,
        groupOrder,
        setGroupOrder,
        fetchGroupOrder,
        !!isAuthenticated,
        user?.id,
    );
    const permissions = useGroupOrderPermissions(groupOrder, user?.id);
    const { getItemImageUrl } = useGroupOrderProductImage();

    if (loading) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-1/2" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!groupOrder) {
        return (
            <main className="bg-gray-50 min-h-screen py-12">
                <div className="custom-container">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                        <p className="text-gray-600">Group order not found.</p>
                        <Link href="/" className="text-[#EE4D2D] hover:underline mt-4 inline-block">
                            Back to home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const shareLink =
        typeof window !== "undefined" ? `${window.location.origin}/group-orders/${shareToken}` : "";

    return (
        <main className="bg-gray-50 min-h-screen py-12">
            <div className="custom-container">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{groupOrder.restaurantName}</h1>
                                <p className="text-sm text-gray-600">Group Order ID: {groupOrder.groupOrderId}</p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    groupOrder.status === GroupOrderStatus.OPEN
                                        ? "bg-green-100 text-green-800"
                                        : groupOrder.status === GroupOrderStatus.LOCKED
                                          ? "bg-yellow-100 text-yellow-800"
                                          : groupOrder.status === GroupOrderStatus.ORDERED
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-red-100 text-red-800"
                                }`}
                            >
                                {groupOrder.status === GroupOrderStatus.OPEN
                                    ? "Open"
                                    : groupOrder.status === GroupOrderStatus.LOCKED
                                      ? "Locked"
                                      : groupOrder.status === GroupOrderStatus.ORDERED
                                        ? "Confirmed"
                                        : "Canceled"}
                            </span>
                        </div>

                        {groupOrder.groupNote && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{groupOrder.groupNote}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                                aria-label="Group order share link"
                            />
                            <button
                                onClick={actions.handleCopyLink}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Copy link"
                            >
                                <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                            {permissions.canJoin &&
                                (isAuthenticated && user ? (
                                    <Link
                                        href={`/group-orders/${shareToken}/join`}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90"
                                    >
                                        <Users className="w-4 h-4" />
                                        Join
                                    </Link>
                                ) : (
                                    <Link
                                        href={`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}/join`)}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#EE4D2D]/90"
                                    >
                                        <Users className="w-4 h-4" />
                                        Sign in to join
                                    </Link>
                                ))}

                            {isAuthenticated && user && permissions.canLock && (
                                <button
                                    onClick={actions.handleLock}
                                    disabled={actions.isProcessing}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4" />
                                    Lock
                                </button>
                            )}
                            {isAuthenticated && user && permissions.canConfirm && (
                                <button
                                    onClick={actions.handleConfirm}
                                    disabled={actions.isProcessing}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    Confirm
                                </button>
                            )}
                            {isAuthenticated && user && permissions.canCancel && (
                                <button
                                    onClick={actions.handleCancel}
                                    disabled={actions.isProcessing}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Participants ({groupOrder.participants.length})
                        </h2>
                        <div className="space-y-4">
                            {groupOrder.participants.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No participants yet.</p>
                            ) : (
                                groupOrder.participants.map((participant) => (
                                    <div key={participant.userId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{participant.userName}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {participant.userId === groupOrder.creatorId && (
                                                        <span className="text-xs text-[#EE4D2D]">(Creator)</span>
                                                    )}
                                                    {participant.userId === user?.id && (
                                                        <span className="text-xs text-blue-600">(You)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">${formatPrice(participant.totalAmount)}</p>
                                                    <span className={`text-xs ${participant.paymentStatus === "paid" ? "text-green-600" : "text-gray-500"}`}>
                                                        {participant.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                                                    </span>
                                                </div>
                                                {(groupOrder.status === GroupOrderStatus.OPEN || groupOrder.status === GroupOrderStatus.LOCKED) && (
                                                    <div className="flex gap-1">
                                                        {participant.userId === user?.id && (
                                                            <Link
                                                                href={`/group-orders/${shareToken}/join`}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Edit items"
                                                            >
                                                                <Edit className="w-4 h-4 text-gray-600" />
                                                            </Link>
                                                        )}
                                                        {(user?.id === groupOrder.creatorId || participant.userId === user?.id) && (
                                                            <button
                                                                onClick={() => actions.handleRemoveParticipant(participant.userId, participant.userName)}
                                                                disabled={actions.isProcessing}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title={participant.userId === user?.id ? "Leave group order" : "Remove participant"}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {participant.items.length > 0 && (
                                            <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                                                {participant.items.map((item, idx) => {
                                                    const imageUrl = getItemImageUrl(item as typeof item & {
                                                        imageURL?: string | null;
                                                        imageUrl?: string | null;
                                                        image?: string | null;
                                                        cartItemImage?: string | null;
                                                    });
                                                    const hasImage = !!imageUrl && imageUrl !== "/placeholder.png";
                                                    return (
                                                        <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 text-sm">
                                                            {hasImage ? (
                                                                <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                                    <Image
                                                                        src={imageUrl!}
                                                                        alt={item.productName}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="48px"
                                                                        unoptimized={imageUrl!.startsWith("http")}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                                                    No Image
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                                                            </div>
                                                            <span className="text-gray-900 font-medium">
                                                                ${formatPrice(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Summary
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Items total:</span>
                                <span>${formatPrice(groupOrder.totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Delivery fee:</span>
                                <span>${formatPrice(groupOrder.deliveryFee)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Tax:</span>
                                <span>${formatPrice(groupOrder.tax)}</span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total:</span>
                                <span>${formatPrice(groupOrder.finalAmount)}</span>
                            </div>
                            {groupOrder.paymentMethod === "split" && (
                                <p className="text-xs text-gray-500 mt-2">Each person pays their own share.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                        <p className="text-gray-700">
                            {groupOrder.deliveryAddress.street}, {groupOrder.deliveryAddress.city}
                            {groupOrder.deliveryAddress.state && `, ${groupOrder.deliveryAddress.state}`}
                            {groupOrder.deliveryAddress.zipCode && ` ${groupOrder.deliveryAddress.zipCode}`}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
