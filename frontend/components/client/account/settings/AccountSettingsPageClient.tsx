"use client";

import { AccountSettingsPageView } from "@/components/client/account/settings/AccountSettingsPageView";
import { SettingsLoading } from "@/components/client/account/settings/SettingsLoading";
import { useAccountPasswordUpdate } from "@/hooks/client/account/useAccountPasswordUpdate";
import { useMounted } from "@/hooks/common/useMounted";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AccountSettingsPageClient() {
    const { user, loading: authLoading } = useAuthStore();
    const mounted = useMounted();
    const {
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
    } = useAccountPasswordUpdate(user?.id ?? null);

    if (!mounted || authLoading) {
        return <SettingsLoading />;
    }

    return (
        <AccountSettingsPageView
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            loading={loading}
            onToggleShowNewPassword={() => setShowNewPassword((prev) => !prev)}
            onToggleShowConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleSubmit}
        />
    );
}


