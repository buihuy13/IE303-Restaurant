"use client";

import type { ComponentProps } from "react";
import EditProfileModal from "@/components/client/Account/EditProfileModal";
import { AccountBanner } from "@/components/client/Account/AccountBanner";
import { AccountStatsGrid } from "@/components/client/Account/AccountStatsGrid";
import { AccountRecentActivity } from "@/components/client/Account/AccountRecentActivity";

type AccountBannerProps = ComponentProps<typeof AccountBanner>;
type AccountStatsGridProps = ComponentProps<typeof AccountStatsGrid>;
type AccountRecentActivityProps = ComponentProps<typeof AccountRecentActivity>;
type EditProfileModalProps = ComponentProps<typeof EditProfileModal>;

export interface AccountPageViewProps {
    bannerProps: AccountBannerProps;
    stats: AccountStatsGridProps["stats"];
    recentActivityProps: Pick<AccountRecentActivityProps, "recentOrders">;
    profileModalProps: Pick<EditProfileModalProps, "isOpen" | "onClose" | "user">;
}

export function AccountPageView({
    bannerProps,
    stats,
    recentActivityProps,
    profileModalProps,
}: AccountPageViewProps) {
    return (
        <>
            <div className="space-y-8">
                <AccountBanner {...bannerProps} />
                <AccountStatsGrid stats={stats} />
                <AccountRecentActivity {...recentActivityProps} />
            </div>
            <EditProfileModal {...profileModalProps} />
        </>
    );
}

