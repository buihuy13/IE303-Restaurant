"use client";

import { useMerchantApplicationsData } from "@/hooks/admin/merchant-applications/useMerchantApplicationsData";
import { useMerchantApplicationFilters } from "@/hooks/admin/merchant-applications/useMerchantApplicationFilters";
import { MerchantApplicationsHeader } from "./MerchantApplicationsHeader";
import { MerchantApplicationsFilters } from "./MerchantApplicationsFilters";
import { MerchantApplicationsTable } from "./MerchantApplicationsTable";

export default function MerchantApplicationsPageClient() {
    const { applications, loading, fetchApplications } = useMerchantApplicationsData();

    const {
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filteredApplications,
    } = useMerchantApplicationFilters(applications);


    const pending = applications.filter((a) => a.status === "PENDING").length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;

    return (
        <div className="space-y-6">
            <MerchantApplicationsHeader
                total={applications.length}
                pending={pending}
                approved={approved}
                rejected={rejected}
            />

            <MerchantApplicationsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
            />

            <MerchantApplicationsTable
                applications={filteredApplications}
                loading={loading}
            />
        </div>
    );
}
