"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/merchant-requests", label: "Merchant requests" },
  { href: "/admin/restaurants", label: "Restaurants" },
  { href: "/admin/order", label: "Orders" },
  { href: "/admin/merchants", label: "Merchants" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/sizes", label: "Sizes" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link href="/admin/dashboard" className="text-lg font-bold text-gray-900">
            Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
