"use client";

import { Check, Copy, Lock, Users, X } from "lucide-react";
import Link from "next/link";

import type { MockGroupOrder, MockGroupOrderStatus } from "@/constants";

type GroupOrderHeaderProps = {
  groupOrder: MockGroupOrder;
  shareToken: string;
  shareLink: string;
  statusLabel: string;
  canJoin: boolean;
  canLock: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  isAuthenticated: boolean;
  onCopyLink: () => void;
  onLock: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const statusStyles: Record<
  MockGroupOrderStatus,
  string
> = {
  open: "bg-green-100 text-green-800",
  locked: "bg-yellow-100 text-yellow-800",
  ordered: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export function GroupOrderHeader({
  groupOrder,
  shareToken,
  shareLink,
  statusLabel,
  canJoin,
  canLock,
  canConfirm,
  canCancel,
  isAuthenticated,
  onCopyLink,
  onLock,
  onConfirm,
  onCancel,
}: GroupOrderHeaderProps) {
  const statusClass = statusStyles[groupOrder.status] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {groupOrder.restaurantName}
          </h1>
          <p className="text-sm text-gray-600">
            Group Order ID: {groupOrder.groupOrderId}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {groupOrder.groupNote && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-700">{groupOrder.groupNote}</p>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
        <label htmlFor="share-link" className="sr-only">
          Group order share link
        </label>
        <input
          id="share-link"
          type="text"
          readOnly
          value={shareLink}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
          aria-label="Group order share link"
        />
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200"
          title="Copy link"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {canJoin && (
          <>
            {isAuthenticated ? (
              <Link
                href={`/group-orders/${shareToken}/join`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EE4D2D] px-4 py-2 text-white transition-colors hover:bg-[#EE4D2D]/90"
              >
                <Users className="h-4 w-4" />
                Join
              </Link>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}/join`)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#EE4D2D] px-4 py-2 text-white transition-colors hover:bg-[#EE4D2D]/90"
              >
                <Users className="h-4 w-4" />
                Sign in to join
              </Link>
            )}
          </>
        )}
        {canLock && (
          <button
            type="button"
            onClick={onLock}
            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600"
          >
            <Lock className="h-4 w-4" />
            Lock
          </button>
        )}
        {canConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          >
            <Check className="h-4 w-4" />
            Confirm
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
