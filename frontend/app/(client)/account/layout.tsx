// File: app/account/layout.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AccountSidebar from "@/components/client/account/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
        return (
                <ProtectedRoute allowedRoles={["USER", "MERCHANT", "ADMIN"]}>
                        <section className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white py-10 lg:py-14">
                                <div className="custom-container">
                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
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
