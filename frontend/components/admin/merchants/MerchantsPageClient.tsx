"use client";

import { MerchantsHeader } from "@/components/admin/merchants/MerchantsHeader";
import { MerchantsStats } from "@/components/admin/merchants/MerchantsStats";
import { MerchantsFilters } from "@/components/admin/merchants/MerchantsFilters";
import { MerchantsTable } from "@/components/admin/merchants/MerchantsTable";
import { useAdminMerchantsData } from "@/hooks/admin/merchants/useAdminMerchantsData";
import { useAdminMerchantFilters } from "@/hooks/admin/merchants/useAdminMerchantFilters";

export default function MerchantsPageClient() {
    const { merchants, loading, fetchMerchants } = useAdminMerchantsData();
    const { searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredMerchants } =
        useAdminMerchantFilters(merchants);
    void fetchMerchants;

    const pending = merchants.filter((m) => m.status === "PENDING").length;
    const approved = merchants.filter((m) => m.status === "APPROVED").length;
    const rejected = merchants.filter((m) => m.status === "REJECTED").length;

    return (
        <div className="space-y-6">
            <MerchantsHeader />
            <MerchantsStats
                total={merchants.length}
                pending={pending}
                approved={approved}
                rejected={rejected}
            />
            <MerchantsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
            />
            <MerchantsTable
                merchants={filteredMerchants}
                loading={loading}
            />
        </div>
    );
}
