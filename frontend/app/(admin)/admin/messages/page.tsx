"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminMessagesPageClient } from "@/components/admin/messages/AdminMessagesPageClient";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function AdminMessagesPage() {
    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center h-[600px]">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
                    </div>
                }
            >
                <AdminMessagesPageClient />
            </Suspense>
        </ProtectedRoute>
    );
}
