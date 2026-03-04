"use client";

import { useState } from "react";

import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutClientProps = { children: React.ReactNode };

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <span className="text-lg">☰</span>
          </button>
          <span className="ml-2 text-sm font-medium text-gray-700">
            Admin area (mock)
          </span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
