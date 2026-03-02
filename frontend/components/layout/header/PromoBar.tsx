import { Gift, Tag, Truck } from "lucide-react";

const promoItems = [
  { icon: Truck, label: "Free delivery over $15" },
  { icon: Gift, label: "Today voucher up to 50% off" },
  { icon: Tag, label: "Flash deals every 2 hours" },
];

export function PromoBar() {
  return (
    <div className="border-t border-stroke/60 bg-brand-yellowlight/40">
      <div className="custom-container mx-auto flex flex-wrap items-center gap-4 px-4 py-2">
        {promoItems.map(({ icon: Icon, label }) => (
          <div key={label} className="inline-flex items-center gap-2 text-xs text-brand-black sm:text-sm">
            <Icon className="h-4 w-4 text-brand-orange" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

