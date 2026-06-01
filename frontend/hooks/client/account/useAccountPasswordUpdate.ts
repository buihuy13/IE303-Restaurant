import { KEYCLOAK_BASE_URL, KEYCLOAK_REALM } from "@/lib/config/publicRuntime";
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
            const accountUrl = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/account/#/security/signingin`;
            window.location.assign(accountUrl);
            toast.success("Redirecting to Keycloak account settings...");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            toast.error("Unable to open Keycloak account settings");
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
