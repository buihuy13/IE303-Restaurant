"use client";

import { useState } from "react";
import { PromotionsHeader } from "@/components/admin/promotions/PromotionsHeader";
import { PromotionsStats } from "@/components/admin/promotions/PromotionsStats";
import { PromotionsFilters } from "@/components/admin/promotions/PromotionsFilters";
import { PromotionsTable } from "@/components/admin/promotions/PromotionsTable";

export default function PromotionsPageClient() {
    const [searchTerm, setSearchTerm] = useState("");

    const handleCreateClick = () => {
        // TODO: open create promotion modal
    };

    return (
        <div className="space-y-6">
            <PromotionsHeader onCreateClick={handleCreateClick} />
            <PromotionsStats />
            <PromotionsFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <PromotionsTable onCreateFirst={handleCreateClick} />
        </div>
    );
}
