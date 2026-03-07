"use client";

import Button from "@/components/Button";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type SettingsPasswordFormProps = {
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    newPassword: string;
    confirmPassword: string;
    loading: boolean;
    onToggleShowNewPassword: () => void;
    onToggleShowConfirmPassword: () => void;
    onNewPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function SettingsPasswordForm(props: SettingsPasswordFormProps) {
    const {
        showNewPassword,
        showConfirmPassword,
        newPassword,
        confirmPassword,
        loading,
        onToggleShowNewPassword,
        onToggleShowConfirmPassword,
        onNewPasswordChange,
        onConfirmPasswordChange,
        onSubmit,
    } = props;

    return (
        <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-2">Change Password</h2>
            <p className="text-sm text-gray-600 mb-4">
                Update your account password. Make sure to use a strong password.
            </p>
            <form onSubmit={onSubmit} className="mt-4 space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <div className="relative">
                        <input
                            title="New Password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => onNewPasswordChange(e.target.value)}
                            className="w-full p-2 border rounded-md pr-10 focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={onToggleShowNewPassword}
                            className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <div className="relative">
                        <input
                            title="Confirm New Password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => onConfirmPasswordChange(e.target.value)}
                            className="w-full p-2 border rounded-md pr-10 focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D]"
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={onToggleShowConfirmPassword}
                            className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <Button
                    type="submit"
                    className="bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                            Updating...
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </div>
    );
}
