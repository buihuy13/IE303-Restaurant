// File: app/account/layout.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSidebar from "@/components/client/account/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
        return (
                <ProtectedRoute allowedRoles={["USER", "MERCHANT", "ADMIN"]}>
                        <section className="py-10 lg:py-14 bg-gradient-to-b from-gray-50 via-gray-50 to-white min-h-screen">
                                <div className="custom-container">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                {/* --- Sidebar --- */}
                                                <aside className="lg:col-span-3">
                                                        <AccountSidebar />
                                                </aside>

                                                {/* --- Main Content --- */}
                                                <main className="lg:col-span-9">{children}</main>
                                        </div>
                                </div>
                        </section>
                </ProtectedRoute>
        );
}
