 "use client";

import { SettingsHeader } from "@/components/client/Account/settings/SettingsHeader";
import { SettingsLoading } from "@/components/client/Account/settings/SettingsLoading";
import { SettingsPasswordForm } from "@/components/client/Account/settings/SettingsPasswordForm";
import { SettingsSecuritySection } from "@/components/client/Account/settings/SettingsSecuritySection";
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-8">
            <SettingsHeader />
            <SettingsPasswordForm
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
            <SettingsSecuritySection />
        </div>
    );
}

