import { authApi } from "@/lib/api/authApi";
import { useState } from "react";
import toast from "react-hot-toast";

export function useAccountPasswordUpdate(userId: string | null) {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userId) {
            toast.error("User information not available");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(userId, {
                password: newPassword,
                confirmPassword,
            });
            toast.success("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            const errorMessage =
                (error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : null) ||
                (error instanceof Error ? error.message : null) ||
                "Failed to update password";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        showNewPassword,
        showConfirmPassword,
        newPassword,
        confirmPassword,
        loading,
        setShowNewPassword,
        setShowConfirmPassword,
        setNewPassword,
        setConfirmPassword,
        handleSubmit,
    };
}
