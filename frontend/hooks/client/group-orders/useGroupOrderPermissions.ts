import { useMemo } from "react";
import { GroupOrderStatus, type GroupOrder } from "@/types/groupOrder.type";

export function useGroupOrderPermissions(groupOrder: GroupOrder | null, userId: string | undefined) {
    return useMemo(() => {
        if (!groupOrder) {
            return {
                isCreator: false,
                isParticipant: false,
                canJoin: false,
                canLock: false,
                canConfirm: false,
                canCancel: false,
            };
        }
        const isCreator = userId === groupOrder.creatorId;
        const isParticipant = !!groupOrder.participants.find((p) => p.userId === userId);
        const canJoin = !isParticipant && groupOrder.status === GroupOrderStatus.OPEN;
        const canLock = isCreator && groupOrder.status === GroupOrderStatus.OPEN && groupOrder.participants.length > 0;
        const canConfirm =
            isCreator &&
            (groupOrder.status === GroupOrderStatus.OPEN || groupOrder.status === GroupOrderStatus.LOCKED);
        const canCancel =
            isCreator &&
            groupOrder.status !== GroupOrderStatus.ORDERED &&
            groupOrder.status !== GroupOrderStatus.CANCELLED;
        return { isCreator, isParticipant, canJoin, canLock, canConfirm, canCancel };
    }, [groupOrder, userId]);
}
