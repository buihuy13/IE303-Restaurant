"use client";

import Button from "@/components/Button";

export function SettingsSecuritySection() {
    return (
        <div className="border-t pt-6">
            <h2 className="text-xl font-semibold">Two-Factor Authentication (2FA)</h2>
            <p className="mt-2 text-gray-600">Secure your account with an extra layer of protection.</p>
            <div className="mt-4">
                <Button className="bg-brand-orange text-white hover:bg-brand-orange/90">Enable 2FA</Button>
            </div>
        </div>
    );
}
