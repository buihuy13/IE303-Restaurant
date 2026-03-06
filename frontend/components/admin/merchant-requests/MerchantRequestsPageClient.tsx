"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MerchantRequestsHeader } from "@/components/admin/merchant-requests/MerchantRequestsHeader";
import { MerchantRequestsStats } from "@/components/admin/merchant-requests/MerchantRequestsStats";
import { MerchantRequestsSearch } from "@/components/admin/merchant-requests/MerchantRequestsSearch";
import { MerchantRequestsList } from "@/components/admin/merchant-requests/MerchantRequestsList";
import { RejectMerchantModal } from "@/components/admin/merchant-requests/RejectMerchantModal";
import { useMerchantRequestsData } from "@/hooks/admin/merchant-requests/useMerchantRequestsData";
import { useMerchantRequestSearch } from "@/hooks/admin/merchant-requests/useMerchantRequestSearch";
import { useMerchantRequestActions } from "@/hooks/admin/merchant-requests/useMerchantRequestActions";
import { useMerchantRequestRejectModal } from "@/hooks/admin/merchant-requests/useMerchantRequestRejectModal";
import type { User } from "@/types";

export default function MerchantRequestsPageClient() {
    const { requests, loading, fetchMerchantRequests } = useMerchantRequestsData();
    const { searchTerm, setSearchTerm, filteredRequests } = useMerchantRequestSearch(requests);
    const { open, target, reason, setReason, openReject, closeReject } = useMerchantRequestRejectModal();
    const { handleApprove, handleReject } = useMerchantRequestActions(fetchMerchantRequests);

    const [processingId, setProcessingId] = useState<string | null>(null);

    const onApprove = async (request: User) => {
        setProcessingId(request.id);
        try {
            await handleApprove(request);
        } finally {
            setProcessingId(null);
        }
    };

    const onRejectConfirm = async () => {
        if (!target) return;
        const trimmed = reason.trim();
        if (!trimmed) {
            toast.error("Please enter a rejection reason");
            return;
        }
        setProcessingId(target.id);
        try {
            await handleReject(target, trimmed);
            closeReject();
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <MerchantRequestsHeader loading={loading} onRefresh={fetchMerchantRequests} />
            <MerchantRequestsStats total={requests.length} filtered={filteredRequests.length} />
            <MerchantRequestsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <MerchantRequestsList
                requests={filteredRequests}
                loading={loading}
                processingId={processingId}
                onApprove={onApprove}
                onReject={openReject}
            />

            <RejectMerchantModal
                open={open}
                onOpenChange={(isOpen) => !isOpen && closeReject()}
                target={target}
                reason={reason}
                onReasonChange={setReason}
                processing={processingId === target?.id}
                onConfirm={onRejectConfirm}
            />
        </div>
    );
}
