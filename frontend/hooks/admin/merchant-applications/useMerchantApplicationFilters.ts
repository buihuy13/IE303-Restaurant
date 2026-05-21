import { useMemo, useState } from "react";
import type { MerchantApplication, ApplicationStatus } from "@/types";

export function useMerchantApplicationFilters(applications: MerchantApplication[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "ALL">("ALL");

    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const q = searchTerm.toLowerCase();
            const matchesSearch =
                app.username.toLowerCase().includes(q) ||
                app.email.toLowerCase().includes(q) ||
                app.resName.toLowerCase().includes(q);
            const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchTerm, filterStatus]);

    return {
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filteredApplications,
    };
}
