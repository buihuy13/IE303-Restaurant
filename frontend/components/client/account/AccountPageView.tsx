"use client";

import type { ComponentProps } from "react";
import EditProfileModal from "@/components/client/account/EditProfileModal";
import { AccountBanner } from "@/components/client/account/AccountBanner";
import { AccountStatsGrid } from "@/components/client/account/AccountStatsGrid";
import { AccountRecentActivity } from "@/components/client/account/AccountRecentActivity";

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

