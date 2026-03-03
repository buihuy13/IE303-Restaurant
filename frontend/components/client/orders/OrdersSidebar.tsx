import { ShoppingBag } from "lucide-react";

export function OrdersSidebar() {
  return (
    <aside className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-brand-black">Account menu</h3>
      <nav className="space-y-2 text-sm font-medium">
        <div className="flex items-center gap-3 rounded-md bg-brand-purple text-white px-4 py-3">
          <ShoppingBag className="h-5 w-5" />
          <span>My orders</span>
        </div>
        <p className="mt-4 text-xs text-brand-grey">
          This is a mock account sidebar for the orders page in IE303.
        </p>
      </nav>
    </aside>
  );
}

