import { useMemo, useState } from "react";
import type { MerchantWithStats } from "./useAdminMerchantsData";

export function useAdminMerchantFilters(merchants: MerchantWithStats[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const filteredMerchants = useMemo(
        () =>
            merchants.filter((merchant) => {
                const matchesSearch =
                    merchant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (merchant.businessName &&
                        merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesStatus = filterStatus === "ALL" || merchant.status === filterStatus;
                return matchesSearch && matchesStatus;
            }),
        [merchants, searchTerm, filterStatus],
    );

    return { searchTerm, setSearchTerm, filterStatus, setFilterStatus, filteredMerchants };
}
