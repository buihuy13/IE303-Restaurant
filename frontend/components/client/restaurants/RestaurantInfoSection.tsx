import type { MockRestaurant } from "@/constants";

type RestaurantInfoSectionProps = {
  restaurant: MockRestaurant;
};

export function RestaurantInfoSection({
  restaurant,
}: RestaurantInfoSectionProps) {
  const address = restaurant.address || "Ho Chi Minh City, Vietnam";
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    address,
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="about" className="scroll-mt-24">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
          About {restaurant.name}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-700 md:text-base">
          This is a mock description for{" "}
          <span className="font-semibold">{restaurant.name}</span>. In the real
          SE347 project this would come from the backend, but here we only show
          static content to demonstrate the UI.
        </p>

        <div className="space-y-4 border-t border-gray-200 pt-6 text-sm text-gray-700 md:text-base">
          <p>
            <span className="font-semibold">Opening hours:</span>{" "}
            {restaurant.openingTime} – {restaurant.closingTime}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {restaurant.address}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {restaurant.phone}
          </p>
        </div>

        <div className="mt-6 h-[260px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            loading="lazy"
            title={`${restaurant.name} location map`}
          />
        </div>
      </div>
    </section>
  );
}

