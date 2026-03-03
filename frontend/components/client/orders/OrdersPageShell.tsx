"use client";

import { OrdersSidebar } from "./OrdersSidebar";
import { OrdersList } from "./OrdersList";
import { useOrdersPage } from "@/hooks/orders/useOrdersPage";

export default function OrdersPageShell() {
  const { orders, totalOrders, sortBy, setSortBy } = useOrdersPage();

  return (
    <div className="custom-container grid grid-cols-1 gap-8 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div>
        <OrdersSidebar />
      </div>
      <div>
        <OrdersList
          orders={orders}
          totalOrders={totalOrders}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>
    </div>
  );
}

