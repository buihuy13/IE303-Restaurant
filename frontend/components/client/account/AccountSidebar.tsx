import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-brand-black">Account</h2>
      <nav className="mt-4 space-y-1 text-sm">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 font-semibold ${
                isActive
                  ? "bg-brand-orange text-brand-white"
                  : "text-brand-black hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

