import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/authApi";
import type { User } from "@/types";

export function useAdminUsersData() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const page = await authApi.getAllUsers({ page: 0, size: 1000 });
            setUsers(Array.isArray(page?.content) ? page.content : []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to load users.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers().catch(() => {
            // error already handled in fetchUsers
        });
    }, []);

    return { users, loading, fetchUsers };
}

