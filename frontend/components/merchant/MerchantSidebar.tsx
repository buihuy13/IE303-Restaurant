"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/merchant", label: "Dashboard" },
  { href: "/merchant/orders", label: "Orders" },
  { href: "/merchant/food", label: "Menu" },
  { href: "/merchant/wallet", label: "Wallet" },
  { href: "/merchant/reports", label: "Reports" },
  { href: "/merchant/manage/settings", label: "Settings" },
  { href: "/merchant/manage/staff", label: "Staff" },
  { href: "/merchant/messages", label: "Messages" },
];

type MerchantSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function MerchantSidebar({ open, onClose }: MerchantSidebarProps) {
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
          <Link href="/merchant" className="text-lg font-bold text-gray-900">
            Merchant
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/merchant" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#EE4D2D] text-white"
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
