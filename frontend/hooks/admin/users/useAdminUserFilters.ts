import { useMemo, useState } from "react";
import type { User } from "@/types";

export function useAdminUserFilters(users: User[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("ALL");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === "ALL" || user.role === filterRole;
            const matchesStatus = filterStatus === "ALL" || (filterStatus === "ACTIVE" ? user.enabled : !user.enabled);
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, filterRole, filterStatus]);

    return {
        searchTerm,
        setSearchTerm,
        filterRole,
        setFilterRole,
        filterStatus,
        setFilterStatus,
        filteredUsers,
    };
}

