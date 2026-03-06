 "use client";

import type { ComponentProps } from "react";
import { SettingsHeader } from "@/components/client/account/settings/SettingsHeader";
import { SettingsPasswordForm } from "@/components/client/account/settings/SettingsPasswordForm";
import { SettingsSecuritySection } from "@/components/client/account/settings/SettingsSecuritySection";

type SettingsPasswordFormProps = ComponentProps<typeof SettingsPasswordForm>;

export type AccountSettingsPageViewProps = SettingsPasswordFormProps;

export function AccountSettingsPageView(props: AccountSettingsPageViewProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-8">
            <SettingsHeader />
            <SettingsPasswordForm {...props} />
            <SettingsSecuritySection />
        </div>
    );
}

