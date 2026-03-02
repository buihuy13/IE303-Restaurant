import { Button } from "@/components/ui";

type FlashSaleItemProps = {
  name: string;
  image?: string;
  oldPrice: string;
  newPrice: string;
  discountLabel: string;
  soldPercentage: number;
};

export function FlashSaleItem({
  name,
  oldPrice,
  newPrice,
  discountLabel,
  soldPercentage,
}: FlashSaleItemProps) {
  const clamped = Math.min(100, Math.max(0, soldPercentage));

  return (
    <div className="group flex flex-[0_0_auto] w-[160px] cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:w-[220px]">
      <div className="relative h-32 w-full bg-gray-200 md:h-40">
        <div className="absolute left-2 top-2 rounded-full bg-brand-orange px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          {discountLabel}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="mb-1 truncate text-sm font-semibold text-brand-black group-hover:text-brand-orange">
          {name}
        </p>
        <div className="mb-2 flex items-baseline text-sm">
          <span className="text-base font-bold text-brand-orange">{newPrice}</span>
          <span className="ml-2 text-xs text-gray-400 line-through">{oldPrice}</span>
        </div>
        <div className="mt-auto space-y-1">
          <div className="h-2 rounded-full bg-orange-100">
            <div
              className="h-2 rounded-full bg-brand-orange"
              style={{ width: `${clamped}%` }}
            />
          </div>
          <p className="text-xs text-brand-grey">Sold {clamped}%</p>
        </div>
      </div>
      <div className="border-t border-gray-100 p-2">
        <Button className="w-full text-xs" variant="ghost" type="button">
          Order now
        </Button>
      </div>
    </div>
  );
}

