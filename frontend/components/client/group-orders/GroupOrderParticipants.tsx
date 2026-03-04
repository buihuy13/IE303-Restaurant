"use client";

import { Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";

import type {
  MockGroupOrder,
  MockGroupOrderParticipant,
} from "@/constants";

type GroupOrderParticipantsProps = {
  groupOrder: MockGroupOrder;
  shareToken: string;
  currentUserId: string | undefined;
  formatPrice: (price: number) => string;
  onRemoveParticipant: (userId: string, userName: string) => void;
};

function ParticipantItemRow({
  item,
  formatPrice,
}: {
  item: { name: string; quantity: number; price: number };
  formatPrice: (n: number) => string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
        No Image
      </div>
      <div className="min-w-0 flex-1 text-gray-700">
        {item.name} x{item.quantity}
      </div>
      <span className="font-medium text-gray-900">
        ${formatPrice(item.price * item.quantity)}
      </span>
    </div>
  );
}

function ParticipantCard({
  participant,
  isCreator,
  isYou,
  shareToken,
  currentUserId,
  groupOrderStatus,
  formatPrice,
  onRemove,
}: {
  participant: MockGroupOrderParticipant;
  isCreator: boolean;
  isYou: boolean;
  shareToken: string;
  currentUserId: string | undefined;
  groupOrderStatus: MockGroupOrder["status"];
  formatPrice: (n: number) => string;
  onRemove: (userId: string, userName: string) => void;
}) {
  const canShowActions =
    groupOrderStatus === "open" || groupOrderStatus === "locked";
  const canEdit = isYou && canShowActions;
  const canRemove = (isCreator || isYou) && canShowActions;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">
            {participant.userName}
          </p>
          <div className="mt-1 flex gap-2">
            {isCreator && (
              <span className="text-xs text-[#EE4D2D]">(Creator)</span>
            )}
            {isYou && (
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
          {canShowActions && (
            <div className="flex gap-1">
              {canEdit && (
                <Link
                  href={`/group-orders/${shareToken}/join`}
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                  title="Edit items"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              )}
              {canRemove && (
                <button
                  type="button"
                  onClick={() =>
                    onRemove(participant.userId, participant.userName)
                  }
                  className="rounded-lg p-2 transition-colors hover:bg-red-50 disabled:opacity-50"
                  title={
                    isYou
                      ? "Leave group order"
                      : "Remove participant"
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {participant.items.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {participant.items.map((item, idx) => (
            <ParticipantItemRow
              key={`${participant.id}-${idx}`}
              item={item}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupOrderParticipants({
  groupOrder,
  shareToken,
  currentUserId,
  formatPrice,
  onRemoveParticipant,
}: GroupOrderParticipantsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
        <Users className="h-5 w-5" />
        Participants ({groupOrder.participants.length})
      </h2>
      {groupOrder.participants.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No participants yet.
        </p>
      ) : (
        <div className="space-y-4">
          {groupOrder.participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              isCreator={participant.userId === groupOrder.creatorId}
              isYou={participant.userId === currentUserId}
              shareToken={shareToken}
              currentUserId={currentUserId}
              groupOrderStatus={groupOrder.status}
              formatPrice={formatPrice}
              onRemove={onRemoveParticipant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
