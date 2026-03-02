"use client";

import { useAdminUsersData } from "@/hooks/admin/users/useAdminUsersData";
import { useAdminUserFilters } from "@/hooks/admin/users/useAdminUserFilters";
import { useAdminUserActions } from "@/hooks/admin/users/useAdminUserActions";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersFilters } from "@/components/admin/users/UsersFilters";
import { UsersTable } from "@/components/admin/users/UsersTable";

export default function UsersPageClient() {
    const { users, loading, fetchUsers } = useAdminUsersData();
    const {
        searchTerm,
        setSearchTerm,
        filterRole,
        setFilterRole,
        filterStatus,
        setFilterStatus,
        filteredUsers,
    } = useAdminUserFilters(users);
    const { handleDeleteUser } = useAdminUserActions(fetchUsers);

    return (
        <div className="space-y-6">
            <UsersHeader />
            <UsersFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterRole={filterRole}
                onFilterRoleChange={setFilterRole}
                filterStatus={filterStatus}
                onFilterStatusChange={setFilterStatus}
            />
            <UsersTable users={filteredUsers} loading={loading} onDelete={handleDeleteUser} />
        </div>
    );
}

