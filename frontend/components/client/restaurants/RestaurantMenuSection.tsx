import type { MockRestaurant } from "@/constants";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type RestaurantMenuSectionProps = {
  restaurant: MockRestaurant;
  menu: MenuItem[];
};

export function RestaurantMenuSection({
  restaurant,
  menu,
}: RestaurantMenuSectionProps) {
  return (
    <section id="menu" className="scroll-mt-24">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Menu at {restaurant.name}
        </h2>
        {menu.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No mock items found for this restaurant.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {menu.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#EE4D2D]">
                    {item.price.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

