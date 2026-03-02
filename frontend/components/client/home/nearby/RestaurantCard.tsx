import { Clock3, MapPin, Star } from "lucide-react";

type RestaurantCardProps = {
  name: string;
  image?: string;
  rating: number;
  distance: string;
  time: string;
  promo: string;
};

export function RestaurantCard({
  name,
  rating,
  distance,
  time,
  promo,
}: RestaurantCardProps) {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-200">
        <div className="absolute left-0 top-0 rounded-br-xl bg-brand-orange px-3 py-1.5 text-xs font-bold text-white shadow-md">
          {promo}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <p className="truncate text-lg font-bold text-brand-black group-hover:text-brand-purple">
          {name}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-grey">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
            {rating.toFixed(1)}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {distance}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5 text-gray-400" />
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}

