"use client";

import Image from "next/image";
import Link from "next/link";
import { DollarSign, Edit, Lock, Trash2, Users, X, Check, Copy } from "lucide-react";
import { GroupOrderStatus, type GroupOrder } from "@/types/groupOrder.type";
import { Button } from "@/components/ui/Button";

export interface GroupOrderActionsProps {
    isProcessing: boolean;
    handleCopyLink: () => void;
    handleLock: () => void;
    handleConfirm: () => void;
    handleCancel: () => void;
    handleRemoveParticipant: (participantUserId: string, userName: string) => void;
}

export interface GroupOrderPermissionsProps {
    isCreator: boolean;
    isParticipant: boolean;
    canJoin: boolean;
    canLock: boolean;
    canConfirm: boolean;
    canCancel: boolean;
}

export interface GroupOrderPageViewProps {
    groupOrder: GroupOrder;
    shareToken: string;
    shareLink: string;
    userId: string | undefined;
    isAuthenticated: boolean;
    actions: GroupOrderActionsProps;
    permissions: GroupOrderPermissionsProps;
    getItemImageUrl: (item: {
        imageURL?: string | null;
        imageUrl?: string | null;
        image?: string | null;
        cartItemImage?: string | null;
    }) => string | null;
}

function formatPrice(price: number) {
    return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function GroupOrderPageView({
    groupOrder,
    shareToken,
    shareLink,
    userId,
    isAuthenticated,
    actions,
    permissions,
    getItemImageUrl,
}: GroupOrderPageViewProps) {
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white py-12">
            <div className="custom-container">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                                    {groupOrder.restaurantName}
                                </h1>
                                <p className="text-sm text-gray-600">Group Order ID: {groupOrder.groupOrderId}</p>
                            </div>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                            <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm text-gray-700">{groupOrder.groupNote}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                                aria-label="Group order share link"
                            />
                            <button
                                onClick={actions.handleCopyLink}
                                className="rounded-full p-2 transition-colors hover:bg-white"
                                title="Copy link"
                            >
                                <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                            {permissions.canJoin &&
                                (isAuthenticated && userId ? (
                                    <Button asChild variant="brand" size="sm" className="h-10 rounded-full shadow-sm">
                                        <Link href={`/group-orders/${shareToken}/join`}>
                                            <Users className="w-4 h-4" />
                                            Join
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button asChild variant="brand" size="sm" className="h-10 rounded-full shadow-sm">
                                        <Link
                                            href={`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}/join`)}`}
                                        >
                                            <Users className="w-4 h-4" />
                                            Sign in to join
                                        </Link>
                                    </Button>
                                ))}

                            {isAuthenticated && userId && permissions.canLock && (
                                <Button
                                    onClick={actions.handleLock}
                                    disabled={actions.isProcessing}
                                    variant="secondary"
                                    size="sm"
                                    className="h-10 rounded-full shadow-sm border border-yellow-200 bg-yellow-50 text-yellow-900 hover:bg-yellow-100"
                                >
                                    <Lock className="w-4 h-4" />
                                    Lock
                                </Button>
                            )}
                            {isAuthenticated && userId && permissions.canConfirm && (
                                <Button
                                    onClick={actions.handleConfirm}
                                    disabled={actions.isProcessing}
                                    variant="secondary"
                                    size="sm"
                                    className="h-10 rounded-full shadow-sm border border-green-200 bg-green-50 text-green-900 hover:bg-green-100"
                                >
                                    <Check className="w-4 h-4" />
                                    Confirm
                                </Button>
                            )}
                            {isAuthenticated && userId && permissions.canCancel && (
                                <Button
                                    onClick={actions.handleCancel}
                                    disabled={actions.isProcessing}
                                    variant="secondary"
                                    size="sm"
                                    className="h-10 rounded-full shadow-sm border border-red-200 bg-red-50 text-red-900 hover:bg-red-100"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Participants ({groupOrder.participants.length})
                        </h2>
                        <div className="space-y-4">
                            {groupOrder.participants.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                    <p className="text-sm text-gray-600">No participants yet.</p>
                                </div>
                            ) : (
                                groupOrder.participants.map((participant) => (
                                    <div
                                        key={participant.userId}
                                        className="rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{participant.userName}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {participant.userId === groupOrder.creatorId && (
                                                        <span className="text-xs text-brand-orange">(Creator)</span>
                                                    )}
                                                    {participant.userId === userId && (
                                                        <span className="text-xs text-blue-600">(You)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">
                                                        ${formatPrice(participant.totalAmount)}
                                                    </p>
                                                    <span
                                                        className={`text-xs ${
                                                            participant.paymentStatus === "paid"
                                                                ? "text-green-600"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {participant.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                                                    </span>
                                                </div>
                                                {(groupOrder.status === GroupOrderStatus.OPEN ||
                                                    groupOrder.status === GroupOrderStatus.LOCKED) && (
                                                    <div className="flex gap-1">
                                                        {participant.userId === userId && (
                                                            <Link
                                                                href={`/group-orders/${shareToken}/join`}
                                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                                title="Edit items"
                                                            >
                                                                <Edit className="w-4 h-4 text-gray-600" />
                                                            </Link>
                                                        )}
                                                        {(userId === groupOrder.creatorId ||
                                                            participant.userId === userId) && (
                                                            <button
                                                                onClick={() =>
                                                                    actions.handleRemoveParticipant(
                                                                        participant.userId,
                                                                        participant.userName,
                                                                    )
                                                                }
                                                                disabled={actions.isProcessing}
                                                                className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                                                title={
                                                                    participant.userId === userId
                                                                        ? "Leave group order"
                                                                        : "Remove participant"
                                                                }
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
                                                    const imageUrl = getItemImageUrl(
                                                        item as typeof item & {
                                                            imageURL?: string | null;
                                                            imageUrl?: string | null;
                                                            image?: string | null;
                                                            cartItemImage?: string | null;
                                                        },
                                                    );
                                                    const hasImage = !!imageUrl && imageUrl !== "/placeholder.png";
                                                    return (
                                                        <div
                                                            key={`${item.productId}-${idx}`}
                                                            className="flex items-center gap-3 text-sm"
                                                        >
                                                            {hasImage ? (
                                                                <div className="relative h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
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
                                                                <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                                    No Image
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-gray-700">
                                                                    {item.productName} x{item.quantity}
                                                                </span>
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

                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
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

                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">Delivery Address</h2>
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

